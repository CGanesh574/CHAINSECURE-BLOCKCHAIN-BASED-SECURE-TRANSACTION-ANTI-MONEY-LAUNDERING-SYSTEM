const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
});

/**
 * @route   GET /api/user/dashboard
 * @desc    Get user dashboard data
 * @access  Private
 */
router.get('/dashboard', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        console.log('📊 Dashboard data for user:', user.email, {
            name: user.name,
            wallet: user.walletAddress,
            accountStatus: user.accountStatus,
            blocked: user.accountStatus === 'BLOCKED'
        });
        
        res.json({
            success: true,
            data: {
                user: {
                    name: user.name,
                    email: user.email,
                    walletAddress: user.walletAddress,
                    phone: user.phone,
                    age: user.age,
                    gender: user.gender,
                    createdAt: user.createdAt,
                    accountStatus: user.accountStatus || 'ACTIVE',
                    kycStatus: user.kycStatus || 'NOT_SUBMITTED',
                    violatedRuleName: user.violatedRuleName,
                    violationDescription: user.violationDescription,
                    violatedRules: user.violatedRules,
                    blockTimestamp: user.blockTimestamp
                }
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data'
        });
    }
});

/**
 * @route   POST /api/user/validate-wallet
 * @desc    Validate and update wallet address if not set
 * @access  Private
 */
router.post('/validate-wallet', authenticate, async (req, res) => {
    try {
        const { connectedWallet } = req.body;
        
        console.log('🔐 Wallet validation request:', { connectedWallet, userId: req.user._id });
        
        if (!connectedWallet) {
            return res.status(400).json({
                success: false,
                message: 'Wallet address is required'
            });
        }
        
        const user = await User.findById(req.user._id);
        console.log('👤 User registered wallet:', user.walletAddress);
        
        // If user doesn't have a wallet address, set it
        if (!user.walletAddress || user.walletAddress === '') {
            user.walletAddress = connectedWallet.toLowerCase();
            user.isWalletVerified = true;
            await user.save();
            
            console.log('✅ Wallet saved for first time:', user.walletAddress);
            
            return res.json({
                success: true,
                message: 'Wallet connected and saved successfully',
                walletAddress: user.walletAddress
            });
        }
        
        // Compare wallet addresses (case-insensitive) - STRICT validation
        const isValid = user.walletAddress.toLowerCase() === connectedWallet.toLowerCase();
        
        if (!isValid) {
            // REJECT wallet mismatch - do NOT allow changing wallet
            console.log('❌ Wallet mismatch - Connected:', connectedWallet, '| Registered:', user.walletAddress);
            
            return res.status(403).json({
                success: false,
                message: 'Connected wallet does not match your registered wallet. Please switch to the correct account in MetaMask.',
                registeredWallet: user.walletAddress,
                connectedWallet: connectedWallet
            });
        }
        
        console.log('✅ Wallet validated successfully');
        res.json({
            success: true,
            message: 'Wallet validated successfully',
            walletAddress: user.walletAddress
        });
        
    } catch (error) {
        console.error('❌ Wallet validation error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Wallet validation failed',
            error: error.message
        });
    }
});

module.exports = router;
