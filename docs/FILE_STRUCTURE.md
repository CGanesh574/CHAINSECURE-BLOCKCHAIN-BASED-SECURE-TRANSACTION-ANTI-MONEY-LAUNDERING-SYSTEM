# ChainSecure Project Structure

## 📂 Complete File Tree

```
chainsecure/
│
├── 📄 README.md                      # Complete project documentation
├── 📄 QUICKSTART.md                  # 5-minute setup guide
├── 📄 DEVELOPMENT.md                 # Developer notes and architecture
├── 📄 PROJECT_SUMMARY.md             # Project overview and achievements
├── 📄 VERIFICATION.md                # Setup verification checklist
├── 📄 FAQ.md                         # Frequently asked questions
├── 📄 .gitignore                     # Git ignore rules
├── 📄 package.json                   # Root package manager
│
├── 📂 backend/                       # Backend API Server
│   │
│   ├── 📂 models/
│   │   └── 📄 User.js                # MongoDB user schema
│   │
│   ├── 📂 routes/
│   │   ├── 📄 auth.js                # Authentication endpoints
│   │   ├── 📄 user.js                # User data endpoints
│   │   ├── 📄 admin.js               # Admin dashboard endpoints
│   │   └── 📄 transaction.js         # Transaction query endpoints
│   │
│   ├── 📂 middleware/
│   │   └── 📄 auth.js                # JWT authentication middleware
│   │
│   ├── 📄 server.js                  # Express server main file
│   ├── 📄 package.json               # Backend dependencies
│   ├── 📄 .env.example               # Environment template
│   └── 📄 .env                       # Environment variables (create from example)
│
├── 📂 frontend/                      # React Frontend Application
│   │
│   ├── 📂 public/
│   │   ├── 📄 index.html             # HTML template
│   │   └── 📄 favicon.ico            # Website icon (optional)
│   │
│   ├── 📂 src/
│   │   │
│   │   ├── 📂 components/            # Reusable React components
│   │   │   ├── 📄 Navbar.tsx         # Navigation bar component
│   │   │   ├── 📄 Navbar.css         # Navbar styles
│   │   │   ├── 📄 SendMoneyModal.tsx # Send transaction modal
│   │   │   └── 📄 SendMoneyModal.css # Modal styles
│   │   │
│   │   ├── 📂 pages/                 # Page components
│   │   │   ├── 📄 Home.tsx           # Landing page
│   │   │   ├── 📄 Home.css           # Home page styles
│   │   │   ├── 📄 About.tsx          # About page
│   │   │   ├── 📄 About.css          # About styles
│   │   │   ├── 📄 Contact.tsx        # Contact page
│   │   │   ├── 📄 Contact.css        # Contact styles
│   │   │   ├── 📄 Login.tsx          # Login page
│   │   │   ├── 📄 Register.tsx       # Registration page
│   │   │   ├── 📄 Auth.css           # Auth pages shared styles
│   │   │   ├── 📄 UserDashboard.tsx  # User dashboard page
│   │   │   ├── 📄 UserDashboard.css  # User dashboard styles
│   │   │   ├── 📄 AdminDashboard.tsx # Admin dashboard page
│   │   │   └── 📄 AdminDashboard.css # Admin dashboard styles
│   │   │
│   │   ├── 📂 services/              # API and Web3 services
│   │   │   ├── 📄 api.ts             # Axios API client
│   │   │   └── 📄 web3.ts            # MetaMask/Web3 functions
│   │   │
│   │   ├── 📄 App.tsx                # Main app component with routing
│   │   ├── 📄 index.tsx              # React entry point
│   │   ├── 📄 index.css              # Global styles
│   │   └── 📄 react-app-env.d.ts     # TypeScript declarations
│   │
│   ├── 📄 package.json               # Frontend dependencies
│   ├── 📄 tsconfig.json              # TypeScript configuration
│   ├── 📄 .env.example               # Environment template
│   └── 📄 .env                       # Environment variables (create from example)
│
└── 📂 blockchain/                    # Smart Contracts & Deployment
    │
    ├── 📂 contracts/
    │   └── 📄 SecureTransaction.sol  # Main smart contract
    │
    ├── 📂 artifacts/                 # Generated after deployment
    │   └── 📄 SecureTransaction.json # Contract ABI and address
    │
    ├── 📄 deploy.js                  # Contract deployment script
    └── 📄 package.json               # Blockchain dependencies
```

---

## 📋 File Purposes

### Root Level
| File | Purpose |
|------|---------|
| `README.md` | Complete project documentation (10,000+ words) |
| `QUICKSTART.md` | Quick 5-minute setup guide |
| `DEVELOPMENT.md` | Architecture decisions and dev notes |
| `PROJECT_SUMMARY.md` | Project overview and achievements |
| `VERIFICATION.md` | Setup verification checklist |
| `FAQ.md` | 50+ frequently asked questions |
| `.gitignore` | Files to exclude from git |
| `package.json` | Root dependencies (optional) |

### Backend Files
| File | Purpose | Lines of Code |
|------|---------|---------------|
| `server.js` | Express server setup and middleware | ~100 |
| `models/User.js` | MongoDB user schema | ~50 |
| `routes/auth.js` | Register, login, wallet verification | ~150 |
| `routes/user.js` | User profile and validation | ~80 |
| `routes/admin.js` | Admin statistics and user management | ~100 |
| `routes/transaction.js` | Blockchain transaction queries | ~100 |
| `middleware/auth.js` | JWT authentication middleware | ~60 |

### Frontend Files
| File | Purpose | Lines of Code |
|------|---------|---------------|
| `App.tsx` | Main routing and protected routes | ~60 |
| `index.tsx` | React app entry point | ~15 |
| `components/Navbar.tsx` | Navigation bar | ~50 |
| `components/SendMoneyModal.tsx` | Transaction sending modal | ~150 |
| `pages/Home.tsx` | Landing page | ~100 |
| `pages/About.tsx` | About page | ~120 |
| `pages/Contact.tsx` | Contact form | ~100 |
| `pages/Login.tsx` | Login form | ~100 |
| `pages/Register.tsx` | Registration with wallet verification | ~250 |
| `pages/UserDashboard.tsx` | User dashboard | ~300 |
| `pages/AdminDashboard.tsx` | Admin dashboard | ~200 |
| `services/api.ts` | Axios HTTP client | ~50 |
| `services/web3.ts` | MetaMask integration | ~200 |

### Blockchain Files
| File | Purpose | Lines of Code |
|------|---------|---------------|
| `contracts/SecureTransaction.sol` | Smart contract | ~100 |
| `deploy.js` | Automated deployment script | ~150 |

---

## 🎯 Key Files to Understand

### For Beginners
1. **README.md** - Start here!
2. **QUICKSTART.md** - Setup guide
3. **frontend/src/pages/Home.tsx** - Simple page example
4. **backend/routes/auth.js** - Basic API routes

### For Developers
1. **blockchain/contracts/SecureTransaction.sol** - Smart contract
2. **frontend/src/services/web3.ts** - Web3 integration
3. **backend/middleware/auth.js** - Authentication logic
4. **frontend/src/pages/Register.tsx** - Wallet verification

### For Learning Blockchain
1. **blockchain/contracts/SecureTransaction.sol** - Solidity code
2. **blockchain/deploy.js** - Deployment process
3. **frontend/src/services/web3.ts** - MetaMask interaction
4. **backend/routes/transaction.js** - Event querying

---

## 📦 Dependencies Overview

### Backend (package.json)
```json
{
  "express": "Web framework",
  "mongoose": "MongoDB ODM",
  "bcrypt": "Password hashing",
  "jsonwebtoken": "JWT authentication",
  "ethers": "Blockchain interaction",
  "cors": "Cross-origin requests",
  "dotenv": "Environment variables"
}
```

### Frontend (package.json)
```json
{
  "react": "UI library",
  "typescript": "Type safety",
  "react-router-dom": "Routing",
  "ethers": "Web3 library",
  "axios": "HTTP client"
}
```

### Blockchain (package.json)
```json
{
  "ethers": "Blockchain library",
  "solc": "Solidity compiler",
  "dotenv": "Environment variables"
}
```

---

## 🔄 Data Flow

### User Registration Flow
```
Register.tsx (Frontend)
    ↓ Collect user data
    ↓ Connect MetaMask
web3.ts (Service)
    ↓ Request signature
MetaMask (Extension)
    ↓ User signs
auth.js (Backend Route)
    ↓ Verify signature
    ↓ Hash password
User.js (Model)
    ↓ Save to database
MongoDB (Database)
    ↓ Return user data
Register.tsx
    ↓ Redirect to dashboard
```

### Transaction Flow
```
SendMoneyModal.tsx (Frontend)
    ↓ User enters amount/recipient
web3.ts (Service)
    ↓ Call contract function
MetaMask (Extension)
    ↓ User confirms
SecureTransaction.sol (Smart Contract)
    ↓ Transfer ETH
    ↓ Emit event
Ganache (Blockchain)
    ↓ Transaction recorded
transaction.js (Backend Route)
    ↓ Query events
UserDashboard.tsx (Frontend)
    ↓ Display transaction
```

---

## 🎨 Component Hierarchy

### Frontend Component Tree
```
App.tsx
├── Navbar.tsx (shared)
├── Routes
│   ├── Public Routes
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   │
│   ├── Protected Routes
│   │   └── UserDashboard.tsx
│   │       └── SendMoneyModal.tsx
│   │
│   └── Admin Routes
│       └── AdminDashboard.tsx
```

---

## 🗄️ Database Schema

### MongoDB Collections

#### users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  phone: String,
  age: Number,
  gender: String,
  walletAddress: String (unique, indexed),
  isWalletVerified: Boolean,
  role: String ('user' | 'admin'),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Environment Variables

### Backend .env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chainsecure
JWT_SECRET=your_secret_key
GANACHE_RPC_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=0x... (filled by deploy script)
ADMIN_EMAIL=admin@chainsecure.com
ADMIN_PASSWORD=admin123
```

### Frontend .env
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GANACHE_RPC_URL=http://127.0.0.1:7545
REACT_APP_CONTRACT_ADDRESS=0x... (filled by deploy script)
```

---

## 📊 File Size Breakdown

### Total Project Size
- **node_modules** (all): ~300-400 MB
- **Source code**: ~200 KB
- **Documentation**: ~100 KB
- **Total**: ~400-500 MB

### Individual Folders
- **backend/node_modules**: ~100 MB
- **frontend/node_modules**: ~200 MB
- **blockchain/node_modules**: ~50 MB
- **Source files**: ~200 KB

---

## 🎯 Quick Navigation Guide

### Want to modify UI?
📂 frontend/src/pages/*.tsx and *.css

### Want to add API endpoint?
📂 backend/routes/*.js

### Want to change smart contract?
📂 blockchain/contracts/SecureTransaction.sol

### Want to add authentication logic?
📂 backend/middleware/auth.js

### Want to modify Web3 functions?
📂 frontend/src/services/web3.ts

### Want to change database schema?
📂 backend/models/User.js

---

## 🚀 Getting Started Path

### Day 1: Setup
1. Read QUICKSTART.md
2. Install all prerequisites
3. Run the application
4. Test basic features

### Day 2: Understanding
1. Read README.md
2. Explore file structure
3. Read code comments
4. Understand data flow

### Day 3: Customization
1. Modify UI styles
2. Add new page
3. Test your changes
4. Review DEVELOPMENT.md

---

**Total Files:** ~50
**Total Lines of Code:** ~5,000+
**Documentation Pages:** 6 major docs
**Project Completion:** 100% ✅

---

*Use this guide to navigate the ChainSecure project efficiently!*
