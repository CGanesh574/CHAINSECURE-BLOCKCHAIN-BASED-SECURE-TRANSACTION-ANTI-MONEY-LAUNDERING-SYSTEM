const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const { authenticate } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

/**
 * Get blockchain contract instance
 */
function getContract() {
    const provider = new ethers.JsonRpcProvider(process.env.GANACHE_RPC_URL);
    
    // Load contract ABI
    const artifactsPath = path.join(__dirname, '../../blockchain/artifacts/SecureTransaction.json');
    
    if (!fs.existsSync(artifactsPath)) {
        throw new Error('Contract artifacts not found. Please deploy the contract first.');
    }
    
    const artifacts = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
    
    const contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        artifacts.abi,
        provider
    );
    
    return { contract, provider };
}

/**
 * @route   GET /api/transactions/user/:address
 * @desc    Get all transactions for a wallet address
 * @access  Private
 */
router.get('/user/:address', authenticate, async (req, res) => {
    try {
        const { address } = req.params;
        
        console.log(`📊 Fetching transactions for address: ${address}`);
        
        if (!ethers.isAddress(address)) {
            console.error('❌ Invalid address format:', address);
            return res.status(400).json({
                success: false,
                message: 'Invalid Ethereum address'
            });
        }
        
        const { contract, provider } = getContract();
        
        console.log('✅ Contract instance created');
        console.log('📍 Contract address:', process.env.CONTRACT_ADDRESS);
        console.log('🔗 RPC URL:', process.env.GANACHE_RPC_URL);
        
        // Get the current block number
        const currentBlock = await provider.getBlockNumber();
        console.log(`📦 Current block number: ${currentBlock}`);
        
        // Query TransactionRecorded events from block 0 to latest
        console.log('🔍 Querying events from block 0 to', currentBlock);
        const filter = contract.filters.TransactionRecorded();
        const events = await contract.queryFilter(filter, 0, currentBlock);
        
        console.log(`📋 Total events found: ${events.length}`);
        
        if (events.length > 0) {
            console.log('Sample event:', {
                from: events[0].args.from,
                to: events[0].args.to,
                amount: ethers.formatEther(events[0].args.amount),
                hash: events[0].transactionHash
            });
        }
        
        // Filter events for this address (as sender or receiver)
        const userTransactions = events
            .filter(event => {
                const from = event.args.from.toLowerCase();
                const to = event.args.to.toLowerCase();
                const userAddr = address.toLowerCase();
                return from === userAddr || to === userAddr;
            })
            .map(event => ({
                from: event.args.from,
                to: event.args.to,
                amount: ethers.formatEther(event.args.amount),
                timestamp: Number(event.args.timestamp),
                transactionType: event.args.transactionType,
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber
            }))
            .sort((a, b) => b.timestamp - a.timestamp); // Most recent first
        
        console.log(`✅ Filtered ${userTransactions.length} transactions for ${address}`);
        
        res.json({
            success: true,
            transactions: userTransactions,
            count: userTransactions.length
        });
        
    } catch (error) {
        console.error('❌ Get transactions error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/transactions/all
 * @desc    Get all blockchain transactions (admin)
 * @access  Private (Admin)
 */
router.get('/all', authenticate, async (req, res) => {
    try {
        console.log('📊 Admin: Fetching all transactions');
        
        // Import AMLEngine for risk calculation
        const AMLEngine = require('../services/amlEngine');
        
        const { contract, provider } = getContract();
        
        // Get the current block number
        const currentBlock = await provider.getBlockNumber();
        console.log(`📦 Current block: ${currentBlock}`);
        
        // Query all TransactionRecorded events from block 0 to latest
        console.log('🔍 Querying all events from block 0 to', currentBlock);
        const filter = contract.filters.TransactionRecorded();
        const events = await contract.queryFilter(filter, 0, currentBlock);
        
        console.log(`📋 Total events found: ${events.length}`);
        
        // First, create basic transaction list
        const allTransactions = events.map(event => ({
            from: event.args.from,
            to: event.args.to,
            amount: ethers.formatEther(event.args.amount),
            timestamp: Number(event.args.timestamp),
            transactionType: event.args.transactionType,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
        
        // Calculate risk scores for each transaction
        const transactionsWithRisk = [];
        for (const transaction of allTransactions) {
            // Get all transactions for the sender up to this point
            const userPastTransactions = allTransactions.filter(tx => 
                tx.from.toLowerCase() === transaction.from.toLowerCase() && 
                tx.timestamp < transaction.timestamp
            );
            
            // Calculate risk score
            const riskData = await AMLEngine.calculateRiskScore(transaction, userPastTransactions);
            
            transactionsWithRisk.push({
                ...transaction,
                riskScore: riskData.riskScore,
                riskLevel: riskData.riskLevel,
                ruleBreakdown: riskData.ruleBreakdown
            });
        }
        
        console.log(`✅ Returning ${transactionsWithRisk.length} transactions with risk scores`);
        
        res.json({
            success: true,
            transactions: transactionsWithRisk,
            count: transactionsWithRisk.length
        });
        
    } catch (error) {
        console.error('❌ Get all transactions error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/transactions/stats
 * @desc    Get transaction statistics
 * @access  Private
 */
router.get('/stats', authenticate, async (req, res) => {
    try {
        const { contract } = getContract();
        
        const totalTransactions = Number(await contract.getTotalTransactions());
        
        res.json({
            success: true,
            stats: {
                totalTransactions
            }
        });
        
    } catch (error) {
        console.error('Get transaction stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction statistics',
            error: error.message
        });
    }
});

module.exports = router;
