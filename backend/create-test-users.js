require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  age: Number,
  gender: String,
  walletAddress: String,
  isWalletVerified: Boolean,
  role: String,
  accountStatus: String,
  violatedRuleName: String,
  violationDescription: String,
  blockTimestamp: Date,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function createTestUsers() {
  try {
    console.log('\n🔍 Checking existing users...\n');
    
    // Check if users exist
    const existingUsers = await User.find({
      email: { $in: ['abc@gmail.com', 'bob@gmail.com'] }
    });
    
    console.log(`Found ${existingUsers.length} existing user(s):\n`);
    existingUsers.forEach(user => {
      console.log(`📧 ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Wallet: ${user.walletAddress}`);
      console.log(`   Status: ${user.accountStatus || 'ACTIVE'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    // Create users if they don't exist
    const usersToCreate = [
      {
        email: 'abc@gmail.com',
        name: 'Alice Brown',
        password: 'password123'
      },
      {
        email: 'bob@gmail.com',
        name: 'Bob Smith',
        password: 'password123'
      }
    ];
    
    for (const userData of usersToCreate) {
      const exists = existingUsers.find(u => u.email === userData.email);
      
      if (!exists) {
        console.log(`\n📝 Creating user: ${userData.email}...`);
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const newUser = new User({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          phone: '1234567890',
          age: 25,
          gender: 'Other',
          walletAddress: '',
          isWalletVerified: false,
          role: 'user',
          accountStatus: 'ACTIVE',
          createdAt: new Date()
        });
        
        await newUser.save();
        console.log(`✅ Created user: ${userData.name} (${userData.email})`);
        console.log(`   Password: ${userData.password}`);
      } else {
        console.log(`\n⚠️  User ${userData.email} already exists!`);
        console.log(`   If you need to reset the password, delete the user and run this script again.`);
      }
    }
    
    console.log('\n================================================');
    console.log('\n📋 LOGIN CREDENTIALS:\n');
    console.log('   Email: abc@gmail.com');
    console.log('   Password: password123');
    console.log('   Name: Alice Brown\n');
    console.log('   Email: bob@gmail.com');
    console.log('   Password: password123');
    console.log('   Name: Bob Smith\n');
    console.log('================================================\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

createTestUsers();
