const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../backend/.env' });

/**
 * Deploy SecureTransaction smart contract to Ganache
 */
async function deployContract() {
    try {
        console.log('🚀 Starting contract deployment...\n');

        // Connect to Ganache
        const ganacheUrl = process.env.GANACHE_RPC_URL || 'http://127.0.0.1:7545';
        const provider = new ethers.JsonRpcProvider(ganacheUrl);
        
        console.log(`📡 Connected to Ganache: ${ganacheUrl}`);

        // Get deployer account (first Ganache account)
        const accounts = await provider.listAccounts();
        if (accounts.length === 0) {
            throw new Error('No accounts found in Ganache. Please start Ganache first.');
        }

        // Use the first account as deployer
        const deployerAddress = accounts[0].address;
        const deployer = await provider.getSigner(deployerAddress);
        
        console.log(`👤 Deployer address: ${deployerAddress}`);

        // Check balance
        const balance = await provider.getBalance(deployerAddress);
        console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ETH\n`);

        // Read contract files
        const contractPath = path.join(__dirname, 'contracts', 'SecureTransaction.sol');
        const contractSource = fs.readFileSync(contractPath, 'utf8');

        // Compile contract using solc
        const solc = require('solc');
        
        const input = {
            language: 'Solidity',
            sources: {
                'SecureTransaction.sol': {
                    content: contractSource
                }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['abi', 'evm.bytecode']
                    }
                }
            }
        };

        console.log('🔨 Compiling contract...');
        const output = JSON.parse(solc.compile(JSON.stringify(input)));

        // Check for compilation errors
        if (output.errors) {
            const errors = output.errors.filter(error => error.severity === 'error');
            if (errors.length > 0) {
                console.error('❌ Compilation errors:');
                errors.forEach(err => console.error(err.formattedMessage));
                process.exit(1);
            }
        }

        const contract = output.contracts['SecureTransaction.sol']['SecureTransaction'];
        const abi = contract.abi;
        const bytecode = contract.evm.bytecode.object;

        console.log('✅ Contract compiled successfully\n');

        // Deploy contract
        console.log('📤 Deploying contract to Ganache...');
        const ContractFactory = new ethers.ContractFactory(abi, bytecode, deployer);
        const deployedContract = await ContractFactory.deploy();
        
        await deployedContract.waitForDeployment();
        const contractAddress = await deployedContract.getAddress();

        console.log(`\n✅ Contract deployed successfully!`);
        console.log(`📍 Contract Address: ${contractAddress}\n`);

        // Save contract artifacts
        const artifacts = {
            address: contractAddress,
            abi: abi,
            bytecode: bytecode,
            deployedAt: new Date().toISOString(),
            network: 'ganache',
            deployer: deployerAddress
        };

        const artifactsDir = path.join(__dirname, 'artifacts');
        if (!fs.existsSync(artifactsDir)) {
            fs.mkdirSync(artifactsDir);
        }

        const artifactsPath = path.join(artifactsDir, 'SecureTransaction.json');
        fs.writeFileSync(artifactsPath, JSON.stringify(artifacts, null, 2));
        
        console.log(`💾 Contract artifacts saved to: ${artifactsPath}\n`);

        // Update backend .env file
        const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');
        let envContent = '';
        
        if (fs.existsSync(backendEnvPath)) {
            envContent = fs.readFileSync(backendEnvPath, 'utf8');
            
            // Update CONTRACT_ADDRESS if exists, otherwise add it
            if (envContent.includes('CONTRACT_ADDRESS=')) {
                envContent = envContent.replace(
                    /CONTRACT_ADDRESS=.*/,
                    `CONTRACT_ADDRESS=${contractAddress}`
                );
            } else {
                envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
            }
        } else {
            // Create new .env file from example
            const examplePath = path.join(__dirname, '..', 'backend', '.env.example');
            envContent = fs.readFileSync(examplePath, 'utf8');
            envContent = envContent.replace(
                /CONTRACT_ADDRESS=.*/,
                `CONTRACT_ADDRESS=${contractAddress}`
            );
        }
        
        fs.writeFileSync(backendEnvPath, envContent);
        console.log(`📝 Updated backend/.env with contract address\n`);

        // Update frontend .env file
        const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env');
        let frontendEnvContent = '';
        
        if (fs.existsSync(frontendEnvPath)) {
            frontendEnvContent = fs.readFileSync(frontendEnvPath, 'utf8');
            
            if (frontendEnvContent.includes('REACT_APP_CONTRACT_ADDRESS=')) {
                frontendEnvContent = frontendEnvContent.replace(
                    /REACT_APP_CONTRACT_ADDRESS=.*/,
                    `REACT_APP_CONTRACT_ADDRESS=${contractAddress}`
                );
            } else {
                frontendEnvContent += `\nREACT_APP_CONTRACT_ADDRESS=${contractAddress}`;
            }
        } else {
            const examplePath = path.join(__dirname, '..', 'frontend', '.env.example');
            frontendEnvContent = fs.readFileSync(examplePath, 'utf8');
            frontendEnvContent = frontendEnvContent.replace(
                /REACT_APP_CONTRACT_ADDRESS=.*/,
                `REACT_APP_CONTRACT_ADDRESS=${contractAddress}`
            );
        }
        
        fs.writeFileSync(frontendEnvPath, frontendEnvContent);
        console.log(`📝 Updated frontend/.env with contract address\n`);

        console.log('🎉 Deployment completed successfully!\n');
        console.log('📋 Next Steps:');
        console.log('   1. Start the backend server: cd backend && npm run dev');
        console.log('   2. Start the frontend: cd frontend && npm start');
        console.log('   3. Import Ganache accounts into MetaMask\n');

    } catch (error) {
        console.error('❌ Deployment failed:');
        console.error(error.message);
        process.exit(1);
    }
}

// Run deployment
deployContract();
