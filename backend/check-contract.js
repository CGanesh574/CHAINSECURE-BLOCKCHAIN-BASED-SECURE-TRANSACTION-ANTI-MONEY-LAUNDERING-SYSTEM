const ethers = require('ethers');
require('dotenv').config();

async function checkContract() {
    try {
        console.log('🔍 Checking Contract Deployment...\n');
        
        const RPC_URL = process.env.GANACHE_RPC_URL;
        const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
        
        console.log('📍 Contract Address from .env:', CONTRACT_ADDRESS);
        console.log('🌐 RPC URL:', RPC_URL);
        
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        
        // Check if contract exists at this address
        const code = await provider.getCode(CONTRACT_ADDRESS);
        
        console.log('\n📦 Contract Code Length:', code.length);
        
        if (code === '0x' || code.length <= 2) {
            console.log('❌ No contract found at this address!');
            console.log('\n💡 Solution: The contract needs to be deployed to Ganache');
            console.log('   Run: cd blockchain && npx truffle migrate --reset --network development');
        } else {
            console.log('✅ Contract exists at this address');
            console.log('   Code preview:', code.substring(0, 100) + '...');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkContract();
