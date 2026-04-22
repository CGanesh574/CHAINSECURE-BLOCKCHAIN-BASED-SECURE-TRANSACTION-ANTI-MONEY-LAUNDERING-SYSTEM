const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function testContract() {
    try {
        // Connect to Ganache
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
        
        // Test connection
        const blockNumber = await provider.getBlockNumber();
        console.log('✅ Connected to Ganache. Current block:', blockNumber);
        
        // Check contract
        const contractAddress = '0xc7B6F497CE18aDB57DF1f1F7EFb570BF7d085511';
        const code = await provider.getCode(contractAddress);
        
        if (code === '0x') {
            console.log('❌ Contract NOT deployed at:', contractAddress);
            console.log('\n⚠️  You need to deploy the contract first!');
            console.log('Run: cd blockchain && npm run migrate:dev');
            return;
        }
        
        console.log('✅ Contract IS deployed at:', contractAddress);
        console.log('Code length:', code.length, 'bytes');
        
        // Load ABI and test contract
        const artifactsPath = path.join(__dirname, 'blockchain/artifacts/SecureTransaction.json');
        if (!fs.existsSync(artifactsPath)) {
            console.log('❌ Contract artifacts not found');
            return;
        }
        
        const artifacts = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
        const contract = new ethers.Contract(contractAddress, artifacts.abi, provider);
        
        // Test contract functions
        const totalTx = await contract.getTotalTransactions();
        console.log('✅ Total transactions:', totalTx.toString());
        
        // Get first account balance
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            const balance = await provider.getBalance(accounts[0].address);
            console.log('\n📊 Account 0:', accounts[0].address);
            console.log('   Balance:', ethers.formatEther(balance), 'ETH');
        }
        
        console.log('\n✅ Everything looks good!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testContract();
