const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

console.log('🧪 Testing User Login Credentials\n');

const testAccounts = [
  { email: 'abc@gmail.com', password: 'password123' },
  { email: 'abc@gmail.com', password: '123456' },
  { email: 'bob@gmail.com', password: 'password123' },
  { email: 'bob@gmail.com', password: '123456' },
];

async function testLogin(email, password) {
  try {
    console.log(`\n📧 Testing: ${email} with password: ${password}`);
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    if (response.data.success) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('   User:', response.data.user.name);
      console.log('   Email:', response.data.user.email);
      console.log('   Wallet:', response.data.user.walletAddress);
      console.log('   Role:', response.data.user.role);
      return true;
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ FAILED:', error.response.data.message);
    } else {
      console.log('❌ ERROR:', error.message);
    }
    return false;
  }
}

async function runTests() {
  console.log('Testing common passwords for abc@gmail.com and bob@gmail.com\n');
  console.log('================================================');
  
  for (const account of testAccounts) {
    await testLogin(account.email, account.password);
  }
  
  console.log('\n================================================');
  console.log('\n💡 If all tests failed, the users might not be registered yet.');
  console.log('   Please register the accounts first at: http://localhost:3000/register');
  console.log('\n   Or provide the correct password for these accounts.');
}

// Wait for server to be ready
setTimeout(runTests, 3000);
