const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const transactionRoutes = require('./routes/transaction');
const amlRoutes = require('./routes/aml');
const amlMonitorRoutes = require('./routes/amlMonitor');
const notificationRoutes = require('./routes/notification');
const kycRoutes = require('./routes/kyc');
const sarRoutes = require('./routes/sar');
const supportRoutes = require('./routes/support');
const contactRoutes = require('./routes/contact');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Body:', req.body);
    next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('✅ Connected to MongoDB');
    // Create admin user on startup
    createAdminUser();
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});

// Create default admin user
async function createAdminUser() {
    const User = require('./models/User');
    const bcrypt = require('bcrypt');
    
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@chainsecure.com';
        const adminExists = await User.findOne({ email: adminEmail });
        
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(
                process.env.ADMIN_PASSWORD || 'admin123',
                10
            );
            
            const admin = new User({
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                phone: '0000000000',
                age: 30,
                gender: 'Other',
                walletAddress: '',
                isWalletVerified: false,
                role: 'admin'
            });
            
            await admin.save();
            console.log(`✅ Admin user created: ${adminEmail}`);
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/aml', amlRoutes);
app.use('/api/aml-monitor', amlMonitorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/sar', sarRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'ChainSecure API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'ChainSecure Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth/*',
            user: '/api/user/*',
            admin: '/api/admin/*',
            transactions: '/api/transactions/*'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
});

module.exports = app;
