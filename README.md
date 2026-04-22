# ChainSecure: Blockchain-Based Secure Transaction System

![ChainSecure](https://img.shields.io/badge/Blockchain-Ethereum-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [User Guide](#user-guide)
- [Admin Guide](#admin-guide)
- [API Documentation](#api-documentation)
- [Smart Contract](#smart-contract)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**ChainSecure** is a modern blockchain-based secure transaction system that enables users to send and receive Ethereum (ETH) with complete transparency and security. Built on Ethereum blockchain technology, ChainSecure provides immutable transaction records, wallet verification, and a user-friendly interface for managing digital assets.

This project is designed for educational purposes and demonstrates the integration of:
- Blockchain technology (Ethereum)
- Smart contracts (Solidity)
- Web3 integration (MetaMask)
- Full-stack development (MERN stack)
- Cryptographic authentication

---

## ✨ Features

### 🔐 User Features
- **Secure Registration**: Email/password authentication with wallet verification
- **Wallet Verification**: Cryptographic signature-based wallet ownership verification
- **MetaMask Integration**: Seamless wallet connection and transaction signing
- **Send ETH**: Transfer ETH to any valid Ethereum address
- **Transaction History**: View complete transaction history with timestamps
- **Real-time Balance**: Live ETH balance updates from blockchain
- **Secure Authentication**: JWT-based session management

### 👨‍💼 Admin Features
- **Dashboard Statistics**: Total users, wallets, and transactions
- **User Management**: View all registered users and their details
- **Read-Only Access**: Monitor system without blockchain modification
- **Transaction Monitoring**: Track all blockchain transactions

### 🔒 Security Features
- Password hashing with bcrypt
- Wallet ownership verification via cryptographic signatures
- JWT token authentication
- Nonce-based replay attack prevention
- Wallet-user matching validation
- Secure blockchain transaction signing

---

## 🛠️ Technology Stack

### Frontend
- **React** 18.2.0 - UI library
- **TypeScript** - Type-safe JavaScript
- **ethers.js** 6.9.0 - Ethereum library
- **axios** - HTTP client
- **react-router-dom** - Routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **ethers.js** - Blockchain interaction

### Blockchain
- **Solidity** 0.8.19 - Smart contract language
- **Ganache** - Local Ethereum blockchain
- **MetaMask** - Web3 wallet

---

## 🏗️ System Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend    │────▶│   MongoDB   │
│   (React)   │◀────│  (Express)   │◀────│             │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │
       │                    │
       ▼                    ▼
┌─────────────┐     ┌──────────────┐
│  MetaMask   │────▶│   Ganache    │
│  (Wallet)   │◀────│ (Blockchain) │
└─────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │Smart Contract│
                    │  (Solidity)  │
                    └──────────────┘
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **MongoDB** (v5 or higher)
   - Download: https://www.mongodb.com/try/download/community
   - Verify: `mongod --version`

3. **Ganache** (v7 or higher)
   - Download: https://trufflesuite.com/ganache/
   - Alternative: Install CLI version: `npm install -g ganache`

4. **MetaMask Browser Extension**
   - Chrome: https://chrome.google.com/webstore
   - Firefox: https://addons.mozilla.org/
   - Search for "MetaMask" and install

5. **Git** (for cloning)
   - Download: https://git-scm.com/
   - Verify: `git --version`

### Optional but Recommended
- **Visual Studio Code** - Code editor
- **Postman** - API testing
- **MongoDB Compass** - Database GUI

---

## 📥 Installation Guide

### Step 1: Clone the Repository

```bash
# Navigate to your desired directory
cd Desktop

# Clone the repository (if using Git)
# Or simply extract the project folder to Desktop
```

### Step 2: Install Dependencies

Open **PowerShell** or **Command Prompt** as Administrator and run:

```bash
# Navigate to project root
cd chainsecure

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install blockchain dependencies
cd ../blockchain
npm install

# Return to root
cd ..
```

### Step 3: Start MongoDB

**Windows:**
```bash
# Option 1: Start as Windows Service
net start MongoDB

# Option 2: Start manually
"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" --dbpath "C:\data\db"
```

**macOS/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or use brew (macOS)
brew services start mongodb-community
```

Verify MongoDB is running:
```bash
mongo --eval "db.version()"
```

### Step 4: Start Ganache

**Option 1: Ganache GUI (Recommended for Beginners)**
1. Open Ganache application
2. Click "Quickstart" or "New Workspace"
3. Note the RPC Server address (usually `http://127.0.0.1:7545`)
4. Keep Ganache running

**Option 2: Ganache CLI**
```bash
ganache --port 7545
```

**Important:** Copy the first few account private keys from Ganache - you'll need them for MetaMask.

---

## ⚙️ Configuration

### Step 1: Configure Backend

```bash
# Navigate to backend
cd backend

# Copy environment example
cp .env.example .env

# Edit .env file (use notepad or any editor)
notepad .env
```

**backend/.env** file should contain:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chainsecure
JWT_SECRET=your_super_secret_jwt_key_change_this_123
GANACHE_RPC_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=will_be_filled_after_deployment
ADMIN_EMAIL=admin@chainsecure.com
ADMIN_PASSWORD=admin123
```

### Step 2: Configure Frontend

```bash
# Navigate to frontend
cd ../frontend

# Copy environment example
cp .env.example .env

# Edit .env file
notepad .env
```

**frontend/.env** file should contain:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GANACHE_RPC_URL=http://127.0.0.1:7545
REACT_APP_CONTRACT_ADDRESS=will_be_filled_after_deployment
```

---

## 🚀 Running the Application

### Step 1: Deploy Smart Contract

**Important:** Do this FIRST before starting backend/frontend!

```bash
# From project root
cd blockchain

# Deploy the contract to Ganache
npm run deploy
```

You should see output like:
```
🚀 Starting contract deployment...
📡 Connected to Ganache: http://127.0.0.1:7545
👤 Deployer address: 0x...
💰 Deployer balance: 100 ETH
🔨 Compiling contract...
✅ Contract compiled successfully
📤 Deploying contract to Ganache...
✅ Contract deployed successfully!
📍 Contract Address: 0xABCDEF...
💾 Contract artifacts saved
📝 Updated backend/.env with contract address
📝 Updated frontend/.env with contract address
🎉 Deployment completed successfully!
```

**Note the Contract Address** - it will be automatically saved to .env files.

### Step 2: Import Ganache Accounts to MetaMask

1. Open MetaMask extension in browser
2. Click on account icon → **Import Account**
3. Select **"Private Key"**
4. Copy a private key from Ganache (click the key icon next to any account)
5. Paste and import
6. Repeat for 2-3 accounts (for testing transactions)

**Add Ganache Network to MetaMask:**
1. Click network dropdown (usually shows "Ethereum Mainnet")
2. Click **"Add Network"** → **"Add a network manually"**
3. Fill in:
   - **Network Name:** Ganache
   - **RPC URL:** http://127.0.0.1:7545
   - **Chain ID:** 1337
   - **Currency Symbol:** ETH
4. Click **"Save"**
5. Switch to Ganache network

### Step 3: Start Backend Server

Open a **new terminal** window:

```bash
# From project root
cd backend

# Start backend server
npm run dev
```

You should see:
```
✅ Connected to MongoDB
✅ Admin user created: admin@chainsecure.com
🚀 Server running on port 5000
📍 API URL: http://localhost:5000
```

Keep this terminal running.

### Step 4: Start Frontend Application

Open **another new terminal** window:

```bash
# From project root
cd frontend

# Start React development server
npm start
```

The application should automatically open in your browser at:
```
http://localhost:3000
```

If not, manually open this URL in your browser.

---

## 👤 User Guide

### Registration Process

1. **Navigate to Home Page**
   - Open http://localhost:3000
   - Click **"Get Started"** or **"Login"**

2. **Go to Register**
   - Click **"Register here"**

3. **Fill Registration Form**
   - Enter: Name, Email, Password, Phone, Age, Gender
   - **Important:** All fields are required

4. **Connect MetaMask**
   - Click **"🦊 Connect MetaMask"**
   - MetaMask popup will appear
   - Select account and click **"Connect"**
   - Your wallet address will be displayed

5. **Verify Wallet**
   - Click **"✓ Verify Wallet"**
   - MetaMask will ask you to sign a message
   - Click **"Sign"** (this doesn't cost gas)
   - Wait for "✅ Wallet Verified" message

6. **Complete Registration**
   - Click **"Register"**
   - You'll be automatically logged in and redirected to dashboard

### Using the Dashboard

1. **Connect Wallet to Dashboard**
   - Click **"🦊 Connect MetaMask"**
   - **Important:** You MUST connect the same wallet you registered with
   - If wallets don't match, you'll see an error

2. **View Wallet Information**
   - Connected address
   - ETH balance (updated in real-time)
   - Network name

3. **Send ETH**
   - Click **"💸 Send Money"**
   - Enter recipient address (can be ANY valid Ethereum address)
   - Enter amount in ETH (minimum 0.001)
   - Click **"Send ETH"**
   - MetaMask will open for confirmation
   - Review gas fees and click **"Confirm"**
   - Wait for transaction confirmation
   - Balance and history will auto-update

4. **View Transaction History**
   - All your transactions are displayed in a table
   - Shows: Type (Sent/Received), From, To, Amount, Date, Transaction Hash
   - Click on transaction hash to view on blockchain explorer

### Logout
- Click **"Logout"** in navbar
- You'll be redirected to home page

---

## 👨‍💼 Admin Guide

### Admin Login

**Default Admin Credentials:**
- **Email:** admin@chainsecure.com
- **Password:** admin123

1. Go to http://localhost:3000/login
2. Enter admin credentials
3. You'll be redirected to Admin Dashboard

### Admin Dashboard Features

1. **Statistics Overview**
   - Total Users
   - Verified Wallets
   - Total Transactions
   - Recent Signups (last 30 days)

2. **User Management**
   - View all registered users
   - See: Name, Email, Wallet, Phone, Age, Gender, Join Date
   - Read-only access (cannot modify)

3. **System Information**
   - Platform version
   - Blockchain details
   - Smart contract info

**Admin Restrictions:**
- ❌ Cannot connect MetaMask
- ❌ Cannot send transactions
- ❌ Cannot modify blockchain data
- ✅ Can view all data
- ✅ Can monitor system

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "age": 25,
  "gender": "Male",
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "walletAddress": "0x...",
    "role": "user"
  }
}
```

#### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### 3. Verify Wallet
```http
POST /auth/verify-wallet
Content-Type: application/json

{
  "walletAddress": "0x...",
  "message": "ChainSecure Wallet Verification...",
  "signature": "0x..."
}
```

### User Endpoints

All user endpoints require authentication header:
```
Authorization: Bearer <jwt_token>
```

#### 1. Get User Profile
```http
GET /user/profile
```

#### 2. Get Dashboard Data
```http
GET /user/dashboard
```

#### 3. Validate Wallet
```http
POST /user/validate-wallet
Content-Type: application/json

{
  "connectedWallet": "0x..."
}
```

### Transaction Endpoints

#### 1. Get User Transactions
```http
GET /transactions/user/:address
Authorization: Bearer <jwt_token>
```

#### 2. Get All Transactions (Admin)
```http
GET /transactions/all
Authorization: Bearer <jwt_token>
```

### Admin Endpoints

#### 1. Get Statistics
```http
GET /admin/stats
Authorization: Bearer <jwt_token>
```

#### 2. Get All Users
```http
GET /admin/users
Authorization: Bearer <jwt_token>
```

#### 3. Get User by ID
```http
GET /admin/users/:id
Authorization: Bearer <jwt_token>
```

---

## 📜 Smart Contract

### Contract Details

**File:** `blockchain/contracts/SecureTransaction.sol`

**Contract Address:** Set after deployment (check .env file)

**Solidity Version:** 0.8.19

### Main Functions

#### recordTransaction
```solidity
function recordTransaction(address _to, uint256 _amount) external payable
```
Records an ETH transaction on the blockchain and emits an event.

**Parameters:**
- `_to`: Recipient address
- `_amount`: Amount in Wei

**Events Emitted:**
```solidity
event TransactionRecorded(
    address indexed from,
    address indexed to,
    uint256 amount,
    uint256 timestamp,
    string transactionType
);
```

#### getTotalTransactions
```solidity
function getTotalTransactions() external view returns (uint256)
```
Returns the total number of transactions processed.

#### getUserTransactionCount
```solidity
function getUserTransactionCount(address _user) external view returns (uint256)
```
Returns the number of transactions for a specific user.

---

## 🔒 Security Features

### 1. Password Security
- Passwords hashed with bcrypt (10 rounds)
- Never stored in plain text
- Secure comparison during login

### 2. Wallet Verification
- Cryptographic signature verification
- Prevents wallet spoofing
- Nonce-based replay attack prevention

### 3. JWT Authentication
- Secure token-based sessions
- 7-day token expiration
- Automatic logout on token expiry

### 4. Wallet-User Matching
- Registered wallet must match connected wallet
- Prevents unauthorized access
- Validated on every dashboard load

### 5. Smart Contract Security
- Input validation
- Reentrancy protection
- Event emission for transparency

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. MetaMask Not Detected
**Error:** "MetaMask is not installed"

**Solution:**
- Install MetaMask browser extension
- Refresh the page
- Check if MetaMask is enabled for the site

#### 2. Wallet Verification Failed
**Error:** "Signature verification failed"

**Solution:**
- Make sure you're signing with the correct account
- Don't reject the signature request
- Clear browser cache and try again

#### 3. Transaction Failed
**Error:** "Transaction failed"

**Possible Causes & Solutions:**
- Insufficient balance → Check ETH balance in MetaMask
- Wrong network → Switch to Ganache network
- Gas too low → Increase gas limit in MetaMask
- Ganache stopped → Restart Ganache

#### 4. Contract Not Deployed
**Error:** "Contract address not configured"

**Solution:**
```bash
cd blockchain
npm run deploy
```
Then restart backend and frontend

#### 5. MongoDB Connection Error
**Error:** "MongoDB connection error"

**Solution:**
- Ensure MongoDB is running: `mongod`
- Check if port 27017 is available
- Verify MONGODB_URI in .env file

#### 6. Port Already in Use
**Error:** "Port 5000 is already in use"

**Solution:**
- Change PORT in backend/.env
- Or kill the process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

#### 7. Cannot Import Ganache Account
**Solution:**
- Make sure Ganache is running
- Copy the PRIVATE KEY (not the address)
- Use "Import Account" in MetaMask, not "Create Account"

#### 8. Wrong Network
**Error:** "Please connect to the correct network"

**Solution:**
- Open MetaMask
- Click network dropdown
- Select "Ganache" or the network you added
- If not listed, add it manually (see Step 2 in Running Application)

---

## 📁 Project Structure

```
chainsecure/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── models/
│   │   └── User.js              # User database model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── user.js              # User routes
│   │   ├── admin.js             # Admin routes
│   │   └── transaction.js       # Transaction routes
│   ├── .env.example             # Environment variables template
│   ├── package.json             # Backend dependencies
│   └── server.js                # Express server entry point
│
├── blockchain/
│   ├── artifacts/               # Compiled contract artifacts
│   ├── contracts/
│   │   └── SecureTransaction.sol # Smart contract
│   ├── deploy.js                # Deployment script
│   └── package.json             # Blockchain dependencies
│
├── frontend/
│   ├── public/
│   │   └── index.html           # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx       # Navigation component
│   │   │   ├── Navbar.css
│   │   │   ├── SendMoneyModal.tsx # Send money modal
│   │   │   └── SendMoneyModal.css
│   │   ├── pages/
│   │   │   ├── Home.tsx         # Home page
│   │   │   ├── Home.css
│   │   │   ├── About.tsx        # About page
│   │   │   ├── About.css
│   │   │   ├── Contact.tsx      # Contact page
│   │   │   ├── Contact.css
│   │   │   ├── Login.tsx        # Login page
│   │   │   ├── Register.tsx     # Registration page
│   │   │   ├── Auth.css         # Auth pages styles
│   │   │   ├── UserDashboard.tsx # User dashboard
│   │   │   ├── UserDashboard.css
│   │   │   ├── AdminDashboard.tsx # Admin dashboard
│   │   │   └── AdminDashboard.css
│   │   ├── services/
│   │   │   ├── api.ts           # API client
│   │   │   └── web3.ts          # Web3/MetaMask service
│   │   ├── App.tsx              # Main app component
│   │   ├── index.tsx            # React entry point
│   │   └── index.css            # Global styles
│   ├── .env.example             # Environment variables template
│   ├── package.json             # Frontend dependencies
│   └── tsconfig.json            # TypeScript configuration
│
├── .gitignore                   # Git ignore rules
├── package.json                 # Root package.json
└── README.md                    # This file
```

---

## 🎓 Educational Value

This project demonstrates:

1. **Blockchain Integration**
   - Smart contract development
   - Web3 interaction
   - Transaction management

2. **Full-Stack Development**
   - React frontend
   - Node.js/Express backend
   - MongoDB database

3. **Security Best Practices**
   - Authentication & authorization
   - Cryptographic signatures
   - Secure password handling

4. **Modern Development**
   - TypeScript usage
   - RESTful API design
   - Component-based architecture

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Your Name**
- College Project
- Year: 2026

---

## 🙏 Acknowledgments

- Ethereum Foundation
- OpenZeppelin
- MetaMask
- Ganache/Truffle Suite
- React Community

---

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review console logs for errors
3. Verify all prerequisites are installed
4. Ensure all services are running (MongoDB, Ganache, Backend, Frontend)

---

## 🎯 Next Steps

After setting up the project, you can:

1. **Test the Application**
   - Register multiple users
   - Send test transactions
   - Verify blockchain records

2. **Explore the Code**
   - Study the smart contract
   - Review API endpoints
   - Understand React components

3. **Extend Functionality** (Future Enhancements)
   - Add transaction filters
   - Implement transaction search
   - Add email notifications
   - Create transaction reports
   - Add multi-signature wallets
   - Implement gas optimization

4. **Deploy to Testnet** (Advanced)
   - Deploy to Goerli or Sepolia testnet
   - Get test ETH from faucets
   - Test with real blockchain

---

## ⚠️ Important Notes

1. **This is for Educational Purposes Only**
   - Not for production use
   - Uses local blockchain (Ganache)
   - No real money involved

2. **Security Warnings**
   - Never share private keys
   - Change default admin password
   - Use strong JWT secret in production
   - Never commit .env files

3. **Development Environment**
   - All data is local
   - Blockchain resets when Ganache restarts
   - MongoDB data persists unless cleared

---

## ✅ Checklist for Successful Setup

- [ ] Node.js installed and verified
- [ ] MongoDB installed and running
- [ ] Ganache installed and running
- [ ] MetaMask extension installed
- [ ] All npm dependencies installed
- [ ] .env files configured (backend & frontend)
- [ ] Smart contract deployed
- [ ] Backend server running
- [ ] Frontend application running
- [ ] MetaMask connected to Ganache network
- [ ] Ganache accounts imported to MetaMask
- [ ] Successfully registered a user
- [ ] Successfully sent a transaction

---

**Happy Coding! 🚀**

If you found this project helpful, please star it and share with others!
#   C H A I N S E C U R E - B L O C K C H A I N - B A S E D - S E C U R E - T R A N S A C T I O N - A N T I - M O N E Y - L A U N D E R I N G - S Y S T E M  
 