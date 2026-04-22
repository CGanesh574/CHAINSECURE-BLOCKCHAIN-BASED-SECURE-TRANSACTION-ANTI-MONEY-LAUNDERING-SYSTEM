# ChainSecure - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Prerequisites Check
```bash
node --version    # Should show v16+
mongod --version  # Should show v5+
```

### 1️⃣ Install Dependencies (One Command)
```bash
cd chainsecure
npm install && cd backend && npm install && cd ../frontend && npm install && cd ../blockchain && npm install && cd ..
```

### 2️⃣ Start MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 3️⃣ Start Ganache
- Open Ganache App → Click "Quickstart"
- **Copy 3-4 private keys** from accounts (click key icon)
- Keep Ganache running

### 4️⃣ Setup Environment Files
```bash
# Backend
cd backend
copy .env.example .env

# Frontend
cd ../frontend
copy .env.example .env
cd ..
```

### 5️⃣ Deploy Smart Contract
```bash
cd blockchain
npm run deploy
```
✅ This will auto-update .env files with contract address

### 6️⃣ Setup MetaMask
1. Install MetaMask extension
2. Import Ganache accounts (use copied private keys)
3. Add Ganache network:
   - Network: Ganache
   - RPC: http://127.0.0.1:7545
   - Chain ID: 1337
   - Symbol: ETH

### 7️⃣ Start Application
Open 2 terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 8️⃣ Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 9️⃣ Test Login
**Admin:**
- Email: admin@chainsecure.com
- Password: admin123

**New User:**
- Click "Register" → Fill form → Connect MetaMask → Verify Wallet

---

## 🎯 First Transaction Test

1. Register 2 users with different MetaMask accounts
2. Login as User 1
3. Connect wallet → Send Money
4. Enter User 2's wallet address
5. Send 0.1 ETH
6. Confirm in MetaMask
7. Check transaction history
8. Login as User 2 to see received transaction

---

## ⚠️ Common Issues

### Port already in use
```bash
# Change port in backend/.env
PORT=5001
```

### Contract deployment failed
- Make sure Ganache is running
- Check RPC URL is http://127.0.0.1:7545

### MetaMask not connecting
- Ensure you're on Ganache network
- Clear MetaMask cache
- Reimport account

---

## 📞 Need Help?

Check the full README.md for:
- Detailed setup instructions
- API documentation
- Troubleshooting guide
- Project architecture

---

**Estimated Setup Time: 5-10 minutes**

Good luck! 🚀
