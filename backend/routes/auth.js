const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * @route   POST /api/auth/verify-wallet
 * @desc    Verify wallet ownership using signature
 * @access  Public
 */
router.post('/verify-wallet', [
    body('walletAddress').isEthereumAddress().withMessage('Invalid Ethereum address'),
    body('message').notEmpty().withMessage('Message is required'),
    body('signature').notEmpty().withMessage('Signature is required')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { walletAddress, message, signature } = req.body;

        // Recover address from signature
        const recoveredAddress = ethers.verifyMessage(message, signature);

        // Compare addresses (case-insensitive)
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: 'Signature verification failed. Wallet address mismatch.'
            });
        }

        res.json({
            success: true,
            message: 'Wallet verified successfully',
            verifiedAddress: recoveredAddress
        });

    } catch (error) {
        console.error('Wallet verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Wallet verification failed',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register new user with verified wallet
 * @access  Public
 */
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('age').isInt({ min: 18, max: 120 }).withMessage('Age must be between 18 and 120'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
    body('walletAddress').optional({ checkFalsy: true }).isEthereumAddress().withMessage('Invalid Ethereum address')
], async (req, res) => {
    try {
        console.log('📝 Registration request received:', req.body);
        
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }

        const { name, email, password, phone, age, gender, walletAddress } = req.body;

        // Check if user already exists by email
        let existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Check if wallet address is provided and already exists
        if (walletAddress) {
            existingUser = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Wallet address already registered'
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
            age,
            gender,
            walletAddress: walletAddress ? walletAddress.toLowerCase() : '',
            isWalletVerified: false // Will be verified when they connect MetaMask
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                walletAddress: user.walletAddress,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                walletAddress: user.walletAddress,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

module.exports = router;
