const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function testTransaction() {
    try {
        console.log('🔗 Connecting to Ganache...');
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
        
        // Get accounts
        const accounts = await provider.listAccounts();
        const account1 = accounts[0]; // Sender
        const account2 = accounts[1]; // Receiver
        
        console.log('\n📊 BEFORE TRANSACTION:');
        const balance1Before = await provider.getBalance(account1.address);
        const balance2Before = await provider.getBalance(account2.address);
        console.log(`Account 1 (${account1.address}):`, ethers.formatEther(balance1Before), 'ETH');
        console.log(`Account 2 (${account2.address}):`, ethers.formatEther(balance2Before), 'ETH');
        
        // Load contract
        const contractAddress = '0xc7B6F497CE18aDB57DF1f1F7EFb570BF7d085511';
        const artifactsPath = path.join(__dirname, 'blockchain/artifacts/SecureTransaction.json');
        const artifacts = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
        
        // Get signer for account 1
        const signer = await provider.getSigner(account1.address);
        const contract = new ethers.Contract(contractAddress, artifacts.abi, signer);
        
        // Send 1 ETH through contract
        const amount = ethers.parseEther('1.0');
        
        console.log('\n💸 Sending 1 ETH from Account 1 to Account 2...');
        const tx = await contract.recordTransaction(account2.address, amount, {
            value: amount
        });
        
        console.log('⏳ Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed!');
        console.log('   Hash:', receipt.hash);
        console.log('   Block:', receipt.blockNumber);
        console.log('   Gas used:', receipt.gasUsed.toString());
        
        // Check balances after
        console.log('\n📊 AFTER TRANSACTION:');
        const balance1After = await provider.getBalance(account1.address);
        const balance2After = await provider.getBalance(account2.address);
        console.log(`Account 1 (${account1.address}):`, ethers.formatEther(balance1After), 'ETH');
        console.log(`Account 2 (${account2.address}):`, ethers.formatEther(balance2After), 'ETH');
        
        // Calculate differences
        const diff1 = balance1Before - balance1After;
        const diff2 = balance2After - balance2Before;
        
        console.log('\n📈 CHANGES:');
        console.log(`Account 1 decreased by:`, ethers.formatEther(diff1), 'ETH (1 ETH + gas fees)');
        console.log(`Account 2 increased by:`, ethers.formatEther(diff2), 'ETH');
        
        if (diff2 === amount) {
            console.log('\n✅ SUCCESS! Account 2 received exactly 1 ETH!');
        } else {
            console.log('\n❌ Balance mismatch detected');
        }
        
        // Check contract total transactions
        const totalTx = await contract.getTotalTransactions();
        console.log('\n📋 Total transactions recorded:', totalTx.toString());
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.data) {
            console.error('Error data:', error.data);
        }
    }
}

testTransaction();
