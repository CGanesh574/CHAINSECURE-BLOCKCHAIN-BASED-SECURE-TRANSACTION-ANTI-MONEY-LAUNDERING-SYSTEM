require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
  accountStatus: String
});

const User = mongoose.model('User', userSchema);

async function resetPasswords() {
  try {
    console.log('\n🔐 Resetting passwords for test users...\n');
    
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const users = ['abc@gmail.com', 'bob@gmail.com'];
    
    for (const email of users) {
      const result = await User.updateOne(
        { email },
        { $set: { password: hashedPassword } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated password for: ${email}`);
      } else {
        console.log(`⚠️  No changes for: ${email} (user might not exist)`);
      }
    }
    
    console.log('\n================================================');
    console.log('\n📋 UPDATED LOGIN CREDENTIALS:\n');
    console.log('   Email: abc@gmail.com');
    console.log('   Password: password123\n');
    console.log('   Email: bob@gmail.com');
    console.log('   Password: password123\n');
    console.log('================================================\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Done!');
  }
}

resetPasswords();
