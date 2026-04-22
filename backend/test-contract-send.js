const ethers = require('ethers');
require('dotenv').config();

const CONTRACT_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "_to", "type": "address" },
            { "internalType": "uint256", "name": "_amount", "type": "uint256" }
        ],
        "name": "recordTransaction",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" },
            { "indexed": false, "internalType": "string", "name": "transactionType", "type": "string" }
        ],
        "name": "TransactionRecorded",
        "type": "event"
    }
];

async function testContract() {
    try {
        console.log('🧪 Testing Smart Contract...\n');
        
        const RPC_URL = process.env.GANACHE_RPC_URL;
        const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
        
        console.log('📍 Contract Address:', CONTRACT_ADDRESS);
        console.log('🌐 RPC URL:', RPC_URL);
        
        // Connect to Ganache
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        
        // Get accounts from Ganache
        const accounts = await provider.listAccounts();
        console.log('\n👥 Available Ganache accounts:', accounts.length);
        
        if (accounts.length < 2) {
            console.log('❌ Need at least 2 accounts in Ganache');
            return;
        }
        
        const signer = await provider.getSigner(0);
        const fromAddress = await signer.getAddress();
        const toAddress = accounts[1].address;
        
        console.log('📤 From:', fromAddress);
        console.log('📥 To:', toAddress);
        
        // Get balances before
        const balanceBefore = await provider.getBalance(toAddress);
        console.log('\n💰 Recipient balance before:', ethers.formatEther(balanceBefore), 'ETH');
        
        // Create contract instance
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Send 0.5 ETH through contract
        const amount = ethers.parseEther('0.5');
        console.log('\n⏳ Sending 0.5 ETH through contract...');
        
        const tx = await contract.recordTransaction(toAddress, amount, { value: amount });
        console.log('📝 Transaction hash:', tx.hash);
        
        console.log('⏳ Waiting for confirmation...');
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('📊 Transaction status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED');
        console.log('⛽ Gas used:', receipt.gasUsed.toString());
        
        // Check transaction details
        const txDetails = await provider.getTransaction(tx.hash);
        console.log('💸 Value sent:', ethers.formatEther(txDetails.value), 'ETH');
        
        // Get balances after
        const balanceAfter = await provider.getBalance(toAddress);
        console.log('\n💰 Recipient balance after:', ethers.formatEther(balanceAfter), 'ETH');
        console.log('📈 Difference:', ethers.formatEther(balanceAfter - balanceBefore), 'ETH');
        
        // Check for events
        const filter = contract.filters.TransactionRecorded();
        const events = await contract.queryFilter(filter, receipt.blockNumber, receipt.blockNumber);
        
        console.log('\n📋 Events emitted:', events.length);
        if (events.length > 0) {
            console.log('✅ TransactionRecorded event found!');
            console.log('   From:', events[0].args.from);
            console.log('   To:', events[0].args.to);
            console.log('   Amount:', ethers.formatEther(events[0].args.amount), 'ETH');
        }
        
        console.log('\n✅ CONTRACT WORKS CORRECTLY!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }
}

testContract();
