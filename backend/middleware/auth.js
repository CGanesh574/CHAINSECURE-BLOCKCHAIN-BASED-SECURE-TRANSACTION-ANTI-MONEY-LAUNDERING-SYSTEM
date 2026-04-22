const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user with all fields needed for account blocking check
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }
        
        // Attach user to request with account status info
        req.user = {
            _id: user._id,
            userId: user._id,
            email: user.email,
            role: user.role,
            accountStatus: user.accountStatus || 'ACTIVE',
            kycStatus: user.kycStatus || 'NOT_SUBMITTED',
            violatedRuleName: user.violatedRuleName,
            violationDescription: user.violationDescription,
            blockTimestamp: user.blockTimestamp
        };
        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Authentication error.'
        });
    }
};

/**
 * Admin authorization middleware
 * Checks if authenticated user is an admin
 */
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

/**
 * Check if account is blocked middleware
 * Prevents blocked users from performing transactions
 */
const checkAccountNotBlocked = (req, res, next) => {
    if (req.user.accountStatus === 'BLOCKED') {
        return res.status(403).json({
            success: false,
            message: 'Your account has been blocked due to AML violations. Contact an administrator.',
            accountBlocked: true,
            violatedRuleName: req.user.violatedRuleName,
            violationDescription: req.user.violationDescription,
            blockTimestamp: req.user.blockTimestamp
        });
    }
    next();
};

/**
 * Check if KYC is approved middleware
 * Prevents users without approved KYC from performing transactions
 */
const checkKYCApproved = (req, res, next) => {
    if (req.user.kycStatus !== 'APPROVED') {
        return res.status(403).json({
            success: false,
            message: 'KYC verification is required to perform transactions. Please complete your KYC verification.',
            kycRequired: true,
            kycStatus: req.user.kycStatus || 'NOT_SUBMITTED'
        });
    }
    next();
};

module.exports = { authenticate, isAdmin, checkAccountNotBlocked, checkKYCApproved };
