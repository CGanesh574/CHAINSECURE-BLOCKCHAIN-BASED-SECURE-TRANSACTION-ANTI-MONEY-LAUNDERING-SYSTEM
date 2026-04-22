const AMLRule = require('../models/AMLRule');
const User = require('../models/User');
const Notification = require('../models/Notification');
const SARReport = require('../models/SARReport');
const emailService = require('./emailService');

/**
 * AML Engine - Evaluates transactions against all active AML rules
 * Automatically blocks users if violations are detected
 */
class AMLEngine {
    
    /**
     * Calculate risk score for a transaction based on ALL AML rules
     * @param {Object} transaction - Transaction data from blockchain
     * @param {Array} allUserTransactions - All past transactions for the user
     * @returns {Object} { riskScore: Number, riskLevel: String, ruleBreakdown: Array }
     */
    static async calculateRiskScore(transaction, allUserTransactions = []) {
        try {
            // Get all active AML rules
            const activeRules = await AMLRule.find({ isActive: true }).sort({ priority: -1 });
            
            if (!activeRules || activeRules.length === 0) {
                return { riskScore: 0, riskLevel: 'Low', ruleBreakdown: [] };
            }
            
            const amount = parseFloat(transaction.amount);
            const fromAddress = transaction.from.toLowerCase();
            
            const ruleBreakdown = [];
            let totalRiskScore = 0;
            
            // Evaluate ALL rules and accumulate risk points
            for (const rule of activeRules) {
                const violation = await this.checkRule(rule, transaction, amount, fromAddress, allUserTransactions);
                
                if (violation.violated) {
                    // Calculate risk points based on severity
                    let riskPoints = 0;
                    switch (rule.severity) {
                        case 'critical':
                            riskPoints = 30;
                            break;
                        case 'high':
                            riskPoints = 20;
                            break;
                        case 'medium':
                            riskPoints = 10;
                            break;
                        case 'low':
                            riskPoints = 5;
                            break;
                        default:
                            riskPoints = 5;
                    }
                    
                    totalRiskScore += riskPoints;
                    
                    ruleBreakdown.push({
                        ruleName: rule.name,
                        ruleType: rule.ruleType,
                        severity: rule.severity,
                        blockTarget: rule.blockTarget || 'sender',
                        reason: violation.reason,
                        riskPoints: riskPoints
                    });
                }
            }
            
            // Cap risk score at 100
            totalRiskScore = Math.min(totalRiskScore, 100);
            
            // Determine risk level
            let riskLevel = 'Low';
            if (totalRiskScore >= 81) {
                riskLevel = 'High';
            } else if (totalRiskScore >= 41) {
                riskLevel = 'Medium';
            }
            
            return {
                riskScore: totalRiskScore,
                riskLevel: riskLevel,
                ruleBreakdown: ruleBreakdown
            };
            
        } catch (error) {
            console.error('Risk calculation error:', error);
            return { riskScore: 0, riskLevel: 'Low', ruleBreakdown: [] };
        }
    }
    
    /**
     * Evaluate a transaction against all active AML rules
     * @param {Object} transaction - Transaction data from blockchain
     * @param {String} transaction.from - Sender wallet address
     * @param {String} transaction.to - Receiver wallet address
     * @param {String} transaction.amount - Transaction amount in ETH
     * @param {Number} transaction.timestamp - Transaction timestamp
     * @param {String} transaction.transactionHash - Blockchain transaction hash
     * @param {Array} allUserTransactions - All past transactions for the user
     * @returns {Object} { violated: boolean, rule: Object|null, reason: String }
     */
    static async evaluateTransaction(transaction, allUserTransactions = []) {
        try {
            // Get all active AML rules
            const activeRules = await AMLRule.find({ isActive: true }).sort({ priority: -1 });
            
            if (!activeRules || activeRules.length === 0) {
                return { violated: false, violations: [] };
            }
            
            const amount = parseFloat(transaction.amount);
            const fromAddress = transaction.from.toLowerCase();
            
            const violations = [];
            const seenViolations = new Set(); // Track unique violations to prevent duplicates
            
            // Evaluate ALL rules (don't stop at first violation)
            for (const rule of activeRules) {
                const violation = await this.checkRule(rule, transaction, amount, fromAddress, allUserTransactions);
                
                if (violation.violated) {
                    // Create unique key to prevent duplicate violations
                    const violationKey = `${rule.name}|${rule.ruleType}|${violation.reason}`;
                    
                    // Only add if not already seen
                    if (!seenViolations.has(violationKey)) {
                        seenViolations.add(violationKey);
                        
                        // Update rule triggered count
                        rule.triggeredCount += 1;
                        rule.lastTriggered = new Date();
                        await rule.save();
                        
                        violations.push({
                            rule: rule,
                            reason: violation.reason
                        });
                    }
                }
            }
            
            return { 
                violated: violations.length > 0, 
                violations: violations
            };
            
        } catch (error) {
            console.error('AML evaluation error:', error);
            throw error;
        }
    }
    
    /**
     * Check if a transaction violates a specific AML rule
     */
    static async checkRule(rule, transaction, amount, fromAddress, allUserTransactions) {
        const params = rule.parameters || {};
        
        switch (rule.ruleType) {
            case 'transaction_limit':
                return this.checkTransactionLimit(amount, params);
                
            case 'velocity':
                return this.checkVelocity(allUserTransactions, params);
                
            case 'threshold':
                return this.checkThreshold(amount, params);
                
            case 'frequency':
                return this.checkFrequency(allUserTransactions, params);
                
            case 'pattern':
                return this.checkPattern(transaction, allUserTransactions, params);
            
            case 'receiver_pattern':
                return this.checkReceiverPattern(transaction, allUserTransactions, params);
                
            case 'behavioral':
                return this.checkBehavioral(allUserTransactions, amount, params);
                
            default:
                return { violated: false, reason: '' };
        }
    }
    
    /**
     * Check transaction limit rule
     */
    static checkTransactionLimit(amount, params) {
        if (params.maxAmount && amount > params.maxAmount) {
            return {
                violated: true,
                reason: `Transaction amount ${amount} ETH exceeds maximum limit of ${params.maxAmount} ETH`
            };
        }
        
        if (params.minAmount && amount < params.minAmount) {
            return {
                violated: true,
                reason: `Transaction amount ${amount} ETH is below minimum threshold of ${params.minAmount} ETH`
            };
        }
        
        return { violated: false, reason: '' };
    }
    
    /**
     * Check velocity rule (transactions within time window)
     */
    static checkVelocity(allUserTransactions, params) {
        if (!params.timeWindow || !params.maxTransactions) {
            return { violated: false, reason: '' };
        }
        
        const now = Math.floor(Date.now() / 1000);
        const timeWindowStart = now - params.timeWindow;
        
        const recentTxCount = allUserTransactions.filter(tx => 
            tx.timestamp >= timeWindowStart
        ).length;
        
        // Add 1 for current transaction
        const totalCount = recentTxCount + 1;
        
        if (totalCount > params.maxTransactions) {
            return {
                violated: true,
                reason: `${totalCount} transactions in ${params.timeWindow / 3600} hours exceeds limit of ${params.maxTransactions}`
            };
        }
        
        return { violated: false, reason: '' };
    }
    
    /**
     * Check threshold rule
     */
    static checkThreshold(amount, params) {
        if (params.threshold && amount >= params.threshold) {
            return {
                violated: true,
                reason: `Transaction amount ${amount} ETH meets or exceeds threshold of ${params.threshold} ETH`
            };
        }
        
        return { violated: false, reason: '' };
    }
    
    /**
     * Check frequency rule
     */
    static checkFrequency(allUserTransactions, params) {
        if (!params.maxTransactions || !params.timeWindow) {
            return { violated: false, reason: '' };
        }
        
        const now = Math.floor(Date.now() / 1000);
        const timeWindowStart = now - params.timeWindow;
        
        const txInWindow = allUserTransactions.filter(tx => 
            tx.timestamp >= timeWindowStart
        ).length + 1; // +1 for current transaction
        
        if (txInWindow > params.maxTransactions) {
            return {
                violated: true,
                reason: `${txInWindow} transactions in time window exceeds maximum of ${params.maxTransactions}`
            };
        }
        
        return { violated: false, reason: '' };
    }
    
    /**
     * Check pattern rule (repeated amounts, round numbers, etc.)
     */
    static checkPattern(transaction, allUserTransactions, params) {
        const amount = parseFloat(transaction.amount);
        
        // Check for round number pattern with proper time window (24 hours)
        if (amount === Math.floor(amount) && amount >= 10) {
            const now = Math.floor(Date.now() / 1000);
            const timeWindowStart = now - 86400; // 24 hours in seconds
            
            const recentRoundTransactions = allUserTransactions
                .filter(tx => {
                    const txAmount = parseFloat(tx.amount);
                    return txAmount === Math.floor(txAmount) && tx.timestamp >= timeWindowStart;
                })
                .slice(0, 5);
            
            if (recentRoundTransactions.length >= 3) {
                return {
                    violated: true,
                    reason: 'Suspicious pattern: Multiple consecutive round number transactions detected'
                };
            }
        }
        
        // Check for repeated exact amounts
        const sameAmountTx = allUserTransactions.filter(tx => 
            Math.abs(parseFloat(tx.amount) - amount) < 0.0001
        ).slice(0, 10);
        
        if (sameAmountTx.length >= 3) {
            return {
                violated: true,
                reason: `Suspicious pattern: Same amount (${amount} ETH) sent multiple times`
            };
        }
        
        return { violated: false, reason: '' };
    }
    
    /**
     * Check receiver pattern rule (many transactions to same receiver in short time)
     */
    static checkReceiverPattern(transaction, allUserTransactions, params) {
        if (!params.maxTransactions || !params.timeWindow) {
            return { violated: false, reason: '' };
        }
        
        const now = Math.floor(Date.now() / 1000);
        const timeWindowStart = now - params.timeWindow;
        const currentReceiver = transaction.to.toLowerCase();
        
        // Count transactions to the same receiver within time window
        const sameReceiverCount = allUserTransactions.filter(tx => {
            const txReceiver = tx.to ? tx.to.toLowerCase() : '';
            return txReceiver === currentReceiver && tx.timestamp >= timeWindowStart;
        }).length;
        
        // Add 1 for current transaction
        const totalCount = sameReceiverCount + 1;
        
        if (totalCount > params.maxTransactions) {
            return {
                violated: true,
                reason: `${totalCount} transactions sent to same receiver (${currentReceiver.substring(0, 10)}...) in ${params.timeWindow / 3600} hour(s) exceeds limit of ${params.maxTransactions}`
            };
        }
        
        return { violated: false, reason: '' };
    }
    
    /**
     * Check behavioral rule
     */
    static checkBehavioral(allUserTransactions, currentAmount, params) {
        if (allUserTransactions.length < 5) {
            return { violated: false, reason: '' };
        }
        
        // Calculate average transaction amount
        const avgAmount = allUserTransactions
            .slice(0, 20)
            .reduce((sum, tx) => sum + parseFloat(tx.amount), 0) / Math.min(20, allUserTransactions.length);
        
        // Check if current transaction is significantly higher than average
        const deviationPercentage = params.percentage || 200; // Default 200%
        
        if (currentAmount > avgAmount * (deviationPercentage / 100)) {
            return {
                violated: true,
                reason: `Transaction amount ${currentAmount} ETH is ${Math.round(currentAmount / avgAmount * 100)}% of user average, exceeding ${deviationPercentage}% threshold`
            };
        }
        
        return { violated: false, reason: '' };
    }
    
    /**
     * Block user account due to AML violations
     * @param {String} walletAddress - User wallet address
     * @param {Array} violations - Array of violated rules [{rule, reason}]
     * @param {String} transactionHash - Transaction hash
     * @param {String} amount - Transaction amount
     * @param {Object} transaction - Full transaction object with to/from addresses
     */
    static async blockUser(walletAddress, violations, transactionHash, amount, transaction = null) {
        try {
            console.log('🔒 Attempting to block user with wallet:', walletAddress);
            console.log(`   ${violations.length} AML rule(s) violated`);

            const normalizedWallet = (walletAddress || '').toString().trim().toLowerCase();
            let user = await User.findOne({ walletAddress: normalizedWallet });

            if (!user) {
                user = await User.findOne({
                    walletAddress: { $regex: `^${normalizedWallet}$`, $options: 'i' }
                });
            }
            
            if (!user) {
                console.error('❌ User not found for wallet:', walletAddress);
                return;
            }
            
            console.log('👤 Found user:', user.email, '- Current status:', user.accountStatus);
            
            // Get the highest severity violation for main display
            const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
            const primaryViolation = violations.reduce((highest, current) => {
                const currentSeverity = severityOrder[current.rule.severity] || 0;
                const highestSeverity = severityOrder[highest.rule.severity] || 0;
                return currentSeverity > highestSeverity ? current : highest;
            });
            
            // Block the user
            user.accountStatus = 'BLOCKED';
            user.violatedRuleName = primaryViolation.rule.name;
            user.violationDescription = primaryViolation.reason;
            
            // Store all violated rules
            user.violatedRules = violations.map(v => ({
                ruleName: v.rule.name,
                reason: v.reason,
                severity: v.rule.severity,
                timestamp: new Date()
            }));
            
            user.blockTimestamp = new Date();
            await user.save();
            
            console.log('✅ User saved with BLOCKED status');
            console.log('   Email:', user.email);
            console.log('   Wallet:', user.walletAddress);
            console.log('   Status:', user.accountStatus);
            console.log('   Violated Rules:');
            violations.forEach(v => {
                console.log(`      - ${v.rule.name}: ${v.reason}`);
            });
            
            // Create notification for user with all violations
            const violationsList = violations.map(v => `• ${v.rule.name}: ${v.reason}`).join('\n');
            
            await Notification.create({
                userId: user._id,
                type: 'AML_VIOLATION',
                title: `Account Blocked - ${violations.length} AML Violation(s) Detected`,
                message: `Your account has been blocked due to suspicious transaction activity detected by the AML system.\n\nViolated Rules:\n${violationsList}`,
                severity: primaryViolation.rule.severity,
                metadata: {
                    ruleName: primaryViolation.rule.name,
                    transactionHash: transactionHash,
                    amount: amount,
                    allViolations: violations.map(v => ({
                        ruleName: v.rule.name,
                        reason: v.reason,
                        severity: v.rule.severity
                    }))
                }
            });
            
            // Generate SAR (Suspicious Activity Report)
            const reportId = `SAR-${Date.now()}-${user._id.toString().substring(0, 8).toUpperCase()}`;
            
            const sarReport = await SARReport.create({
                reportId: reportId,
                userId: user._id,
                walletAddress: user.walletAddress,
                userDetails: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    age: user.age || null,
                    gender: user.gender || ''
                },
                violationType: primaryViolation.rule.ruleType,
                violatedRules: violations.map(v => ({
                    ruleName: v.rule.name,
                    severity: v.rule.severity,
                    reason: v.reason,
                    timestamp: new Date()
                })),
                transactionDetails: transaction ? {
                    transactionHash: transactionHash,
                    amount: amount,
                    timestamp: new Date(transaction.timestamp * 1000),
                    from: transaction.from,
                    to: transaction.to
                } : {
                    transactionHash: transactionHash,
                    amount: amount,
                    timestamp: new Date(),
                    from: walletAddress,
                    to: ''
                },
                blockTimestamp: new Date(),
                status: 'PENDING'
            });
            
            console.log(`📄 SAR Report generated: ${reportId}`);
            console.log(`✋ User account blocked: ${user.email} (${walletAddress}) - ${violations.length} rule(s) violated`);
            
            // Send email notification to user about account blocking
            try {
                await emailService.sendAccountBlockedEmail(
                    {
                        name: user.name,
                        email: user.email
                    },
                    violations.map(v => ({
                        ruleName: v.rule.name,
                        severity: v.rule.severity,
                        reason: v.reason
                    }))
                );
                console.log(`📧 Account blocked email sent to: ${user.email}`);
            } catch (emailError) {
                console.error('❌ Failed to send account blocked email:', emailError.message);
                // Don't throw error - blocking should still succeed even if email fails
            }
            
        } catch (error) {
            console.error('Error blocking user:', error);
            throw error;
        }
    }
}

module.exports = AMLEngine;
