# ChainSecure - Ganache & Truffle Setup Guide

## Prerequisites
✅ Ganache installed
✅ Node.js installed
✅ MongoDB Atlas connected

## Current Status
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:3001
- ✅ MongoDB Atlas connected
- ✅ Truffle configuration created

## How to Deploy Smart Contract with Ganache

### Step 1: Start Ganache
1. Open Ganache application
2. Create a new workspace or use "Quick Start"
3. Make sure it's running on `http://127.0.0.1:7545`
4. Note down one of the account addresses and private keys (you'll need this for testing)

### Step 2: Deploy Contract Using Truffle

```bash
# Navigate to blockchain directory
cd C:\Users\Ganesh\OneDrive\Desktop\chainsecure\blockchain

# Compile the smart contracts
npm run compile

# Deploy to Ganache (development network)
npm run migrate:dev
```

### Step 3: Update Backend .env File
After deployment, copy the contract address from the terminal output and update your backend .env file:

```
CONTRACT_ADDRESS=<your_deployed_contract_address>
```

### Alternative: Deploy Using Node Script
If you prefer the existing deploy.js script:

```bash
cd C:\Users\Ganesh\OneDrive\Desktop\chainsecure\blockchain
npm run deploy
```

## User Registration Flow

### ✅ Fixed Registration Process:
1. **Go to Register page** (http://localhost:3001/register)
2. **Fill in all required fields:**
   - Full Name
   - Email Address
   - Phone Number (any format accepted)
   - Age (18+)
   - Gender
   - Password (minimum 6 characters)
   - Confirm Password
   - Wallet Address (OPTIONAL - can leave empty)

3. **Click Register**
   - No MetaMask connection needed during registration
   - User will be registered and automatically logged in
   - Redirected to dashboard

### After Login - Connect MetaMask:
1. In the User Dashboard, you'll see a "Connect MetaMask" button
2. Click to connect your MetaMask wallet
3. If you didn't provide a wallet during registration, it will save your MetaMask address
4. If you provided a wallet, it will validate the connection
5. Once connected:
   - View your wallet balance
   - See current network
   - Send transactions
   - Disconnect wallet anytime

## Testing the Application

### Test User Registration:
1. Open http://localhost:3001/register
2. Create a new account with valid details
3. Login with those credentials

### Test Admin Login:
- Email: `admin@chainsecure.com`
- Password: `admin123`

### Test Wallet Connection:
1. Login to user dashboard
2. Click "Connect MetaMask"
3. Approve the connection
4. View balance and send transactions

## Truffle Commands

```bash
# Compile contracts
truffle compile

# Migrate to Ganache (reset database)
truffle migrate --reset

# Run tests
truffle test

# Open Truffle console
truffle console
```

## Ganache Configuration Details

**truffle-config.js** is configured for:
- **Host:** 127.0.0.1
- **Port:** 7545 (Ganache GUI default)
- **Network ID:** * (any)
- **Solidity Version:** 0.8.19

## Troubleshooting

### Registration Not Working:
✅ **FIXED** - Phone validation relaxed, wallet address now optional

### Backend Connection Issues:
- Check if backend is running on port 5000
- Verify MongoDB connection string in backend/.env
- Check console for error messages

### MetaMask Issues:
- Make sure MetaMask is installed
- Connect to the same network as Ganache (usually Localhost 7545)
- Import an account from Ganache using private key for testing

### Contract Deployment Issues:
- Ensure Ganache is running
- Check that port 7545 is not blocked
- Verify truffle-config.js settings match Ganache

## Important Files Created/Updated

1. **blockchain/truffle-config.js** - Truffle configuration for Ganache
2. **blockchain/migrations/1_initial_migration.js** - Initial migration
3. **blockchain/migrations/2_deploy_contracts.js** - Contract deployment
4. **blockchain/contracts/Migrations.sol** - Migration helper contract
5. **backend/models/User.js** - Fixed wallet address to be optional
6. **backend/routes/auth.js** - Relaxed phone validation
7. **frontend/src/pages/Register.tsx** - Removed mandatory MetaMask connection

## Next Steps

1. ✅ Start Ganache
2. ✅ Deploy contract using `npm run migrate:dev`
3. ✅ Update CONTRACT_ADDRESS in backend .env
4. ✅ Test registration and login
5. ✅ Connect MetaMask in dashboard
6. ✅ Test sending transactions

## Support

If you encounter any issues:
1. Check all terminals for error messages
2. Verify all services are running (Backend, Frontend, MongoDB, Ganache)
3. Check browser console for frontend errors
4. Review backend logs for API errors
