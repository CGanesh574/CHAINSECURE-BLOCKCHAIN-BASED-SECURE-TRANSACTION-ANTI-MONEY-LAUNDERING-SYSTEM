const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './backend/.env' });

const User = require('./backend/models/User');

async function testAdminLogin() {
    try {
        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB\n');

        // Check if admin exists
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@chainsecure.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        console.log('📧 Admin Email:', adminEmail);
        console.log('🔑 Admin Password:', adminPassword);
        console.log('');
        
        const admin = await User.findOne({ email: adminEmail });
        
        if (!admin) {
            console.log('❌ Admin user NOT found in database!');
            console.log('Creating admin user...\n');
            
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const newAdmin = new User({
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
            
            await newAdmin.save();
            console.log('✅ Admin user created successfully!\n');
            
            const verifyAdmin = await User.findOne({ email: adminEmail });
            console.log('👤 Admin User Details:');
            console.log('   ID:', verifyAdmin._id);
            console.log('   Name:', verifyAdmin.name);
            console.log('   Email:', verifyAdmin.email);
            console.log('   Role:', verifyAdmin.role);
        } else {
            console.log('✅ Admin user found in database!\n');
            console.log('👤 Admin User Details:');
            console.log('   ID:', admin._id);
            console.log('   Name:', admin.name);
            console.log('   Email:', admin.email);
            console.log('   Role:', admin.role);
            console.log('');
            
            // Test password
            const isPasswordValid = await bcrypt.compare(adminPassword, admin.password);
            if (isPasswordValid) {
                console.log('✅ Admin password is correct!');
            } else {
                console.log('❌ Admin password is INCORRECT!');
                console.log('⚠️  Updating password...');
                
                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                admin.password = hashedPassword;
                await admin.save();
                
                console.log('✅ Admin password updated!');
            }
        }
        
        console.log('\n📝 Login credentials:');
        console.log('   Email:', adminEmail);
        console.log('   Password:', adminPassword);
        console.log('\n✅ Admin login should work now!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

testAdminLogin();
