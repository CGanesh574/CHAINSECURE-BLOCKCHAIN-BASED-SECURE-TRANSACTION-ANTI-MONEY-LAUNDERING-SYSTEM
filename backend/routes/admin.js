const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');
const emailService = require('../services/emailService');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

/**
 * Get blockchain contract instance
 */
function getContract() {
    const provider = new ethers.JsonRpcProvider(process.env.GANACHE_RPC_URL);
    
    // Load contract ABI
    const artifactsPath = path.join(__dirname, '../../blockchain/artifacts/SecureTransaction.json');
    const artifacts = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
    
    const contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        artifacts.abi,
        provider
    );
    
    return { contract, provider };
}

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Admin
 */
router.get('/stats', authenticate, isAdmin, async (req, res) => {
    try {
        // Get total users (excluding admin)
        const totalUsers = await User.countDocuments({ role: 'user' });
        
        // Get total registered wallets
        const totalWallets = await User.countDocuments({
            role: 'user',
            isWalletVerified: true
        });
        
        // Get total blockchain transactions
        let totalTransactions = 0;
        try {
            const { contract } = getContract();
            totalTransactions = Number(await contract.getTotalTransactions());
        } catch (error) {
            console.error('Error fetching blockchain stats:', error.message);
        }
        
        // Get recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentRegistrations = await User.countDocuments({
            role: 'user',
            createdAt: { $gte: thirtyDaysAgo }
        });
        
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalWallets,
                totalTransactions,
                recentRegistrations
            }
        });
        
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (admin only)
 * @access  Admin
 */
router.get('/users', authenticate, isAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' })
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            users,
            count: users.length
        });
        
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user details by ID
 * @access  Admin
 */
router.get('/users/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user
        });
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user details'
        });
    }
});

/**
 * @route   GET /api/admin/recent-activity
 * @desc    Get recent transaction activity for admin dashboard with risk scores
 * @access  Admin
 */
router.get('/recent-activity', authenticate, isAdmin, async (req, res) => {
    try {
        // Import AMLEngine for risk calculation
        const AMLEngine = require('../services/amlEngine');
        
        const { contract } = getContract();
        
        // Get ALL transactions from blockchain (from block 0 to latest)
        const filter = contract.filters.TransactionRecorded();
        const events = await contract.queryFilter(filter, 0, 'latest'); // Query from genesis block to latest
        
        console.log(`Found ${events.length} transactions on blockchain`);
        
        // Get all transactions, oldest first for proper history
        const allTransactions = events.map((event) => {
            // Handle different possible event.args structures
            const args = event.args;
            const from = args._from || args[0] || args.from;
            const to = args._to || args[1] || args.to;
            const amount = args._amount || args[2] || args.amount;
            const timestamp = args._timestamp || args[3] || args.timestamp;
            
            return {
                from: from,
                to: to,
                amount: amount ? ethers.formatEther(amount) : '0',
                timestamp: timestamp ? Number(timestamp) : Date.now() / 1000,
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber
            };
        });
        
        // Sort by timestamp to get chronological order
        allTransactions.sort((a, b) => a.timestamp - b.timestamp);
        
        // Calculate risk scores for each transaction
        const activitiesWithRisk = [];
        for (const transaction of allTransactions) {
            // Get all transactions for the sender up to this point
            const userPastTransactions = allTransactions.filter(tx => 
                tx.from.toLowerCase() === transaction.from.toLowerCase() && 
                tx.timestamp < transaction.timestamp
            );
            
            // Calculate risk score
            const riskData = await AMLEngine.calculateRiskScore(transaction, userPastTransactions);
            
            activitiesWithRisk.push({
                ...transaction,
                riskScore: riskData.riskScore,
                riskLevel: riskData.riskLevel,
                ruleBreakdown: riskData.ruleBreakdown
            });
        }
        
        // Reverse to show newest first in UI
        activitiesWithRisk.reverse();
        
        console.log(`✅ Returning ${activitiesWithRisk.length} transactions with risk scores`);
        
        res.json({
            success: true,
            activities: activitiesWithRisk,
            count: activitiesWithRisk.length
        });
        
    } catch (error) {
        console.error('Get recent activity error:', error);
        res.json({
            success: true,
            activities: [], // Return empty array if blockchain not available
            count: 0
        });
    }
});

/**
 * @route   GET /api/admin/blocked-users
 * @desc    Get all blocked users and their history (including unblocked users)
 * @access  Admin
 */
router.get('/blocked-users', authenticate, isAdmin, async (req, res) => {
    try {
        // Get users who are currently blocked OR have block history
        const blockedUsers = await User.find({ 
            role: 'user',
            $or: [
                { accountStatus: 'BLOCKED' },
                { 'blockHistory.0': { $exists: true } }  // Has at least one block history entry
            ]
        })
        .select('-password')
        .sort({ blockTimestamp: -1, 'blockHistory.blockedAt': -1 });
        
        res.json({
            success: true,
            users: blockedUsers,
            count: blockedUsers.length
        });
        
    } catch (error) {
        console.error('Get blocked users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blocked users'
        });
    }
});

/**
 * @route   POST /api/admin/unblock-user/:userId
 * @desc    Unblock a user account and save to history
 * @access  Admin
 */
router.post('/unblock-user/:userId', authenticate, isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user.userId;
        
        const user = await User.findById(userId);
        const admin = await User.findById(adminId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (user.accountStatus !== 'BLOCKED') {
            return res.status(400).json({
                success: false,
                message: 'User account is not blocked'
            });
        }
        
        // Store the violation details in history before clearing
        const blockHistoryEntry = {
            ruleName: user.violatedRuleName || 'Unknown',
            reason: user.violationDescription || 'AML Violation',
            severity: user.violatedRules && user.violatedRules.length > 0 ? 
                      user.violatedRules[0].severity : 'high',
            blockedAt: user.blockTimestamp || new Date(),
            unblockedAt: new Date(),
            unblockedBy: admin ? admin.email : 'Admin'
        };
        
        // Add to block history
        if (!user.blockHistory) {
            user.blockHistory = [];
        }
        user.blockHistory.push(blockHistoryEntry);
        
        const previousViolation = {
            ruleName: user.violatedRuleName,
            description: user.violationDescription,
            blockTimestamp: user.blockTimestamp
        };
        
        // Unblock the user
        user.accountStatus = 'ACTIVE';
        user.violatedRuleName = '';
        user.violationDescription = '';
        user.blockTimestamp = null;
        user.violatedRules = [];
        await user.save();
        
        // Create notification for user
        await Notification.create({
            userId: user._id,
            type: 'ACCOUNT_UNBLOCKED',
            title: 'Account Unblocked',
            message: 'Your account has been unblocked by the administrator. You can now resume transactions.',
            severity: 'medium',
            metadata: {
                adminId: adminId,
                previousViolation: previousViolation.ruleName
            }
        });
        
        console.log(`✅ User account unblocked: ${user.email} by admin ${adminId}`);
        
        // Send email notification to user about account unblocking
        try {
            await emailService.sendAccountUnblockedEmail(
                {
                    name: user.name,
                    email: user.email
                },
                previousViolation.ruleName
            );
            console.log(`📧 Account unblocked email sent to: ${user.email}`);
        } catch (emailError) {
            console.error('❌ Failed to send account unblocked email:', emailError.message);
            // Don't throw error - unblocking should still succeed even if email fails
        }
        
        res.json({
            success: true,
            message: 'User account unblocked successfully',
            user: {
                id: user._id,
                email: user.email,
                accountStatus: user.accountStatus
            }
        });
        
    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unblock user'
        });
    }
});

module.exports = router;
