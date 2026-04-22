const ethers = require('ethers');
require('dotenv').config();

const CONTRACT_ABI = require('../blockchain/artifacts/SecureTransaction.json').abi;

async function testEvents() {
    try {
        console.log('🔧 Testing Event Query from Ganache...\n');
        
        const RPC_URL = process.env.GANACHE_RPC_URL;
        const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
        
        console.log('📍 Contract Address:', CONTRACT_ADDRESS);
        console.log('🌐 RPC URL:', RPC_URL);
        
        // Create provider and contract
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        // Get current block
        const currentBlock = await provider.getBlockNumber();
        console.log('📦 Current Block:', currentBlock);
        
        // Query all TransactionRecorded events
        console.log('\n🔍 Querying TransactionRecorded events from block 0 to', currentBlock, '...\n');
        
        const filter = contract.filters.TransactionRecorded();
        const events = await contract.queryFilter(filter, 0, currentBlock);
        
        console.log('✅ Found', events.length, 'events\n');
        
        if (events.length > 0) {
            console.log('📋 Event Details:\n');
            events.forEach((event, index) => {
                console.log(`Event ${index + 1}:`);
                console.log('  Block:', event.blockNumber);
                console.log('  From:', event.args.from);
                console.log('  To:', event.args.to);
                console.log('  Amount:', ethers.formatEther(event.args.amount), 'ETH');
                console.log('  Timestamp:', new Date(Number(event.args.timestamp) * 1000).toISOString());
                console.log('  Type:', event.args.transactionType);
                console.log('---');
            });
        } else {
            console.log('⚠️ No events found!');
            console.log('\nPossible reasons:');
            console.log('1. Wrong contract address');
            console.log('2. Contract not deployed or no transactions made yet');
            console.log('3. Wrong RPC URL (not connected to Ganache)');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testEvents();
