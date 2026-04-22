const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const { authenticate } = require('../middleware/auth');
const AMLEngine = require('../services/amlEngine');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

/**
 * Get blockchain contract instance
 */
function getContract() {
    const provider = new ethers.JsonRpcProvider(process.env.GANACHE_RPC_URL);
    
    const artifactsPath = path.join(__dirname, '../../blockchain/artifacts/SecureTransaction.json');
    const artifacts = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
    
    const contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        artifacts.abi,
        provider
    );
    
    return { contract, provider };
}

function getBlockTargets(violations = []) {
    const senderViolations = [];
    const receiverViolations = [];

    violations.forEach((v) => {
        const target = (v?.rule?.blockTarget || 'sender').toString().toLowerCase();

        if (target === 'sender' || target === 'both') {
            senderViolations.push(v);
        }

        if (target === 'receiver' || target === 'both') {
            receiverViolations.push(v);
        }
    });

    return { senderViolations, receiverViolations };
}

function buildReceiverViolations(violations = []) {
    return violations.map((v) => ({
        ...v,
        reason: `Due to high amount credit in your account. Received funds from transaction flagged by AML rule "${v.rule.name}".`
    }));
}

/**
 * @route   POST /api/aml/evaluate-transaction
 * @desc    Evaluate a confirmed transaction against AML rules (called after MetaMask confirmation)
 * @access  Private
 */
router.post('/evaluate-transaction', authenticate, async (req, res) => {
    try {
        const { transactionHash } = req.body;
        
        if (!transactionHash) {
            return res.status(400).json({
                success: false,
                message: 'Transaction hash is required'
            });
        }
        
        console.log(`🔍 Evaluating transaction: ${transactionHash}`);
        
        const { provider, contract } = getContract();
        
        // Wait for transaction to be mined
        const receipt = await provider.getTransactionReceipt(transactionHash);
        
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found or not yet mined'
            });
        }
        
        // Parse the transaction event
        const iface = new ethers.Interface(JSON.parse(
            fs.readFileSync(path.join(__dirname, '../../blockchain/artifacts/SecureTransaction.json'), 'utf8')
        ).abi);
        
        let transactionData = null;
        
        for (const log of receipt.logs) {
            try {
                const parsed = iface.parseLog(log);
                if (parsed && parsed.name === 'TransactionRecorded') {
                    transactionData = {
                        from: parsed.args.from,
                        to: parsed.args.to,
                        amount: ethers.formatEther(parsed.args.amount),
                        timestamp: Number(parsed.args.timestamp),
                        transactionType: parsed.args.transactionType,
                        transactionHash: transactionHash,
                        blockNumber: receipt.blockNumber
                    };
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!transactionData) {
            return res.status(400).json({
                success: false,
                message: 'Not a valid SecureTransaction'
            });
        }
        
        // Get sender's transaction history
        const fromAddress = transactionData.from.toLowerCase();
        const filter = contract.filters.TransactionRecorded();
        const currentBlock = await provider.getBlockNumber();
        const events = await contract.queryFilter(filter, 0, currentBlock);
        
        const userTransactions = events
            .filter(event => event.args.from.toLowerCase() === fromAddress)
            .map(event => ({
                from: event.args.from,
                to: event.args.to,
                amount: ethers.formatEther(event.args.amount),
                timestamp: Number(event.args.timestamp),
                transactionType: event.args.transactionType,
                transactionHash: event.transactionHash
            }))
            .filter(tx => tx.transactionHash !== transactionHash) // Exclude current transaction
            .sort((a, b) => b.timestamp - a.timestamp);
        
        // Evaluate transaction against AML rules
        const evaluation = await AMLEngine.evaluateTransaction(transactionData, userTransactions);
        
        // Calculate risk score
        const riskData = await AMLEngine.calculateRiskScore(transactionData, userTransactions);
        
        console.log(`📊 Risk Score: ${riskData.riskScore} (${riskData.riskLevel})`);
        if (riskData.ruleBreakdown.length > 0) {
            console.log(`   Risk breakdown:`);
            riskData.ruleBreakdown.forEach(rule => {
                console.log(`   - ${rule.ruleName}: +${rule.riskPoints} points (${rule.severity})`);
            });
        }
        
        // If risk score is HIGH (81-100), block the account
        if (riskData.riskScore >= 81) {
            console.log(`🚨 HIGH RISK SCORE DETECTED (${riskData.riskScore}) - Auto-blocking account`);
            
            // Convert rule breakdown to violations format for blocking
            const violations = riskData.ruleBreakdown.map(rule => ({
                rule: {
                    name: rule.ruleName,
                    ruleType: rule.ruleType,
                    severity: rule.severity,
                    blockTarget: rule.blockTarget || 'sender'
                },
                reason: rule.reason
            }));

            const { senderViolations, receiverViolations } = getBlockTargets(violations);

            const senderShouldBeBlocked = senderViolations.length > 0;
            const receiverShouldBeBlocked =
                receiverViolations.length > 0 &&
                transactionData.to &&
                transactionData.to.toLowerCase() !== transactionData.from.toLowerCase();

            if (senderShouldBeBlocked) {
                await AMLEngine.blockUser(
                    transactionData.from,
                    senderViolations,
                    transactionHash,
                    transactionData.amount,
                    transactionData
                );
            }

            if (receiverShouldBeBlocked) {
                await AMLEngine.blockUser(
                    transactionData.to,
                    buildReceiverViolations(receiverViolations),
                    transactionHash,
                    transactionData.amount,
                    transactionData
                );
            }
            
            return res.json({
                success: true,
                amlStatus: 'HIGH_RISK_BLOCKED',
                violated: true,
                riskScore: riskData.riskScore,
                riskLevel: riskData.riskLevel,
                riskBreakdown: riskData.ruleBreakdown,
                violations: violations.map(v => ({
                    name: v.rule.name,
                    severity: v.rule.severity,
                    reason: v.reason,
                    blockTarget: v.rule.blockTarget || 'sender'
                })),
                accountBlocked: senderShouldBeBlocked,
                receiverBlocked: receiverShouldBeBlocked,
                message: receiverShouldBeBlocked
                    ? `High risk score detected (${riskData.riskScore}/100). Blocking was applied based on rule block target selection.`
                    : senderShouldBeBlocked
                        ? `High risk score detected (${riskData.riskScore}/100). Your account has been blocked for security review.`
                        : `High risk score detected (${riskData.riskScore}/100). Receiver account has been blocked based on rule block target selection.`
            });
        }
        
        if (evaluation.violated) {
            console.log(`⚠️ AML VIOLATION DETECTED!`);
            console.log(`   ${evaluation.violations.length} rule(s) violated:`);
            evaluation.violations.forEach(v => {
                console.log(`   - ${v.rule.name}: ${v.reason}`);
            });
            
            const { senderViolations, receiverViolations } = getBlockTargets(evaluation.violations);

            const senderShouldBeBlocked = senderViolations.length > 0;
            const receiverShouldBeBlocked =
                receiverViolations.length > 0 &&
                transactionData.to &&
                transactionData.to.toLowerCase() !== transactionData.from.toLowerCase();

            if (senderShouldBeBlocked) {
                await AMLEngine.blockUser(
                    transactionData.from,
                    senderViolations,
                    transactionHash,
                    transactionData.amount,
                    transactionData // Pass full transaction object for SAR report
                );
            }

            if (receiverShouldBeBlocked) {
                await AMLEngine.blockUser(
                    transactionData.to,
                    buildReceiverViolations(receiverViolations),
                    transactionHash,
                    transactionData.amount,
                    transactionData
                );
            }
            
            return res.json({
                success: true,
                amlStatus: 'VIOLATED',
                violated: true,
                riskScore: riskData.riskScore,
                riskLevel: riskData.riskLevel,
                riskBreakdown: riskData.ruleBreakdown,
                violations: evaluation.violations.map(v => ({
                    name: v.rule.name,
                    severity: v.rule.severity,
                    reason: v.reason,
                    blockTarget: v.rule.blockTarget || 'sender'
                })),
                violationCount: evaluation.violations.length,
                accountBlocked: senderShouldBeBlocked,
                receiverBlocked: receiverShouldBeBlocked,
                message: receiverShouldBeBlocked
                    ? `${evaluation.violations.length} AML violation(s) detected. Blocking was applied based on rule block target selection.`
                    : senderShouldBeBlocked
                        ? `${evaluation.violations.length} AML violation(s) detected. Your account has been blocked.`
                        : `${evaluation.violations.length} AML violation(s) detected. Receiver account has been blocked based on rule block target selection.`
            });
        }
        
        console.log(`✅ Transaction passed AML checks`);
        
        return res.json({
            success: true,
            amlStatus: 'PASSED',
            violated: false,
            riskScore: riskData.riskScore,
            riskLevel: riskData.riskLevel,
            riskBreakdown: riskData.ruleBreakdown,
            message: 'Transaction complies with all AML rules'
        });
        
    } catch (error) {
        console.error('AML evaluation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to evaluate transaction',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/aml/check-account-status
 * @desc    Check if user account is blocked
 * @access  Private
 */
router.get('/check-account-status', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('accountStatus violatedRuleName violationDescription violatedRules blockTimestamp');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            accountStatus: user.accountStatus,
            isBlocked: user.accountStatus === 'BLOCKED',
            violatedRuleName: user.violatedRuleName || null,
            violationDescription: user.violationDescription || null,
            violatedRules: user.violatedRules || [],
            blockTimestamp: user.blockTimestamp || null
        });
        
    } catch (error) {
        console.error('Check account status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check account status'
        });
    }
});

module.exports = router;
