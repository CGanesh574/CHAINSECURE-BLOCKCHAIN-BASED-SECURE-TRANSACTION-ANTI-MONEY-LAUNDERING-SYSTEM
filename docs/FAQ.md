# ChainSecure - Frequently Asked Questions (FAQ)

## 📚 Table of Contents

- [General Questions](#general-questions)
- [Installation & Setup](#installation--setup)
- [Technical Questions](#technical-questions)
- [Usage Questions](#usage-questions)
- [Troubleshooting](#troubleshooting)
- [Security Questions](#security-questions)
- [Development Questions](#development-questions)

---

## General Questions

### Q1: What is ChainSecure?
**A:** ChainSecure is a blockchain-based secure transaction system that allows users to send and receive Ethereum (ETH) with complete transparency and security. It's built using React, Node.js, MongoDB, and Ethereum blockchain technology.

### Q2: Is this a real cryptocurrency application?
**A:** No, this is an educational project that runs on a local Ganache blockchain. It uses test ETH that has no real-world value. It's designed for learning blockchain development concepts.

### Q3: Can I use real money with this application?
**A:** No, this application is configured for local development only using Ganache (a local blockchain simulator). The ETH used is test currency with no real value.

### Q4: Who should use this project?
**A:** This project is ideal for:
- Students learning blockchain development
- Developers building Web3 portfolios
- Anyone interested in Ethereum and smart contracts
- College project submissions
- Interview preparation

### Q5: Is this project complete?
**A:** Yes! Phase 1 is fully complete with all core features working:
- User registration & authentication
- Wallet verification
- Sending/receiving ETH
- Transaction history
- Admin dashboard

---

## Installation & Setup

### Q6: What do I need to install?
**A:** You need:
1. Node.js (v16+)
2. MongoDB (v5+)
3. Ganache (blockchain simulator)
4. MetaMask browser extension
5. A code editor (VS Code recommended)

### Q7: How long does setup take?
**A:** With all prerequisites installed, setup takes about 5-10 minutes. First-time installation with all software may take 30-45 minutes.

### Q8: Can I run this on Windows?
**A:** Yes! ChainSecure works on Windows, macOS, and Linux. The installation steps are similar across all platforms.

### Q9: Do I need a powerful computer?
**A:** No, ChainSecure runs fine on most modern computers with:
- 4GB RAM (8GB recommended)
- 2GB free disk space
- Any modern processor

### Q10: Can I run this without internet?
**A:** Yes! Once dependencies are installed, ChainSecure runs entirely offline since it uses a local blockchain (Ganache) and local database (MongoDB).

---

## Technical Questions

### Q11: What programming languages are used?
**A:**
- **Frontend:** TypeScript/JavaScript (React)
- **Backend:** JavaScript (Node.js/Express)
- **Smart Contract:** Solidity
- **Styling:** CSS3

### Q12: Why use Ganache instead of a real blockchain?
**A:** Ganache is perfect for development because:
- No real money at risk
- Instant transactions (no waiting)
- Free unlimited test ETH
- Complete control over blockchain
- Easy debugging

### Q13: Can I deploy this to a real blockchain?
**A:** Yes! You can deploy to:
- Ethereum testnets (Goerli, Sepolia)
- Ethereum mainnet (requires real ETH for gas)
- Layer 2 solutions (Polygon, Arbitrum)

However, significant changes would be needed for production use.

### Q14: How does wallet verification work?
**A:** 
1. User connects MetaMask wallet
2. Application generates a unique message (with nonce + timestamp)
3. User signs the message using their private key
4. Backend verifies the signature cryptographically
5. This proves the user owns the wallet without exposing the private key

### Q15: Why MongoDB and not a SQL database?
**A:** MongoDB was chosen for:
- Flexible schema (good for development)
- Easy to set up
- NoSQL benefits for user profiles
- Fast prototyping
- JSON-like documents

You can replace it with PostgreSQL/MySQL if preferred.

### Q16: What is the smart contract doing?
**A:** The SecureTransaction smart contract:
- Records ETH transactions
- Emits events for tracking
- Maintains transaction counters
- Provides transaction history
- Ensures immutable record-keeping

---

## Usage Questions

### Q17: How do I create an account?
**A:**
1. Click "Register" on the home page
2. Fill in your details (name, email, password, etc.)
3. Click "Connect MetaMask"
4. Select your MetaMask account
5. Click "Verify Wallet"
6. Sign the message in MetaMask
7. Click "Register"

### Q18: Can I use any MetaMask account?
**A:** Yes! You can register any MetaMask account. However, each wallet can only be registered once. The same wallet cannot be used for multiple user accounts.

### Q19: How do I get test ETH?
**A:** Ganache provides each account with 100 test ETH automatically. No faucets or external sources needed!

### Q20: Can I send ETH to any address?
**A:** Yes! You can send to:
- Other registered ChainSecure users
- Any valid Ethereum address
- Non-registered wallets
- External addresses

### Q21: How long do transactions take?
**A:** On Ganache, transactions are instant (1-2 seconds). On real networks:
- Testnet: 15-30 seconds
- Mainnet: 15-30 seconds (depends on gas price)

### Q22: What happens if I close the browser during a transaction?
**A:** Once you confirm in MetaMask, the transaction is sent to the blockchain. Closing the browser won't cancel it. Check your transaction history after reopening.

### Q23: Can I cancel a transaction?
**A:** No, once a transaction is confirmed on the blockchain, it cannot be cancelled. This is a fundamental blockchain property (immutability).

### Q24: How do I view my transaction history?
**A:** After logging in and connecting your wallet, scroll down to the "Transaction History" section on your dashboard. All your transactions are listed there.

---

## Troubleshooting

### Q25: "MetaMask is not installed" error
**A:** Install the MetaMask browser extension from:
- Chrome: chrome.google.com/webstore
- Firefox: addons.mozilla.org
Then refresh the page.

### Q26: "Wallet verification failed" error
**A:** This usually means:
- You rejected the signature request (don't click reject!)
- You're using a different account than you connected
- MetaMask is locked

**Fix:** Try again and make sure to approve the signature request.

### Q27: "Connected wallet does not match registered wallet"
**A:** You must connect the same wallet you registered with. 
**Fix:** Switch to the correct account in MetaMask.

### Q28: Transaction fails with no error message
**A:** Check:
- You have enough ETH balance
- You're connected to Ganache network in MetaMask
- Ganache is still running
- The recipient address is valid

### Q29: "MongoDB connection error"
**A:** 
**Fix:** Start MongoDB service:
- Windows: `net start MongoDB`
- macOS/Linux: `sudo systemctl start mongod`

### Q30: Port 5000 already in use
**A:** Another application is using port 5000.
**Fix 1:** Change PORT in backend/.env to 5001
**Fix 2:** Kill the process using port 5000

### Q31: Contract address shows as "undefined"
**A:** Contract wasn't deployed.
**Fix:** Run `cd blockchain && npm run deploy`

### Q32: Ganache account shows 0 ETH
**A:** You might have spent all test ETH.
**Fix:** Restart Ganache to get fresh accounts with 100 ETH each.

---

## Security Questions

### Q33: Is my private key safe?
**A:** Yes! Your private key NEVER leaves MetaMask. The application only:
- Requests signatures (for verification)
- Requests transactions (which you must approve)
Private keys are never sent to the backend or stored anywhere.

### Q34: How are passwords stored?
**A:** Passwords are hashed using bcrypt with a salt before storage. The original password cannot be recovered from the hash.

### Q35: Can the admin see my private key or password?
**A:** No! Admins can see:
- Your name, email, wallet address
- Transaction history
They CANNOT see:
- Your password (stored as hash)
- Your private key (never sent to server)

### Q36: Is the JWT token secure?
**A:** The JWT token is signed with a secret key and expires after 7 days. For additional security in production, you should:
- Use HTTPS
- Store tokens in httpOnly cookies
- Implement token refresh
- Add rate limiting

### Q37: Can someone fake a wallet signature?
**A:** No! Cryptographic signatures can only be created by the wallet owner (who has the private key). The signature proves ownership without revealing the private key.

### Q38: What if I forget my password?
**A:** Currently, there's no password recovery feature. This is a development limitation. In production, you would add:
- Email verification
- Password reset flow
- Security questions

---

## Development Questions

### Q39: Can I modify the code?
**A:** Absolutely! This is an open educational project. Feel free to:
- Customize the UI
- Add new features
- Modify the smart contract
- Change the database
- Improve security

### Q40: How do I add new features?
**A:** Follow these steps:
1. Plan your feature
2. Modify smart contract if needed (redeploy)
3. Add backend API endpoints
4. Create frontend components
5. Test thoroughly

### Q41: Can I deploy to production?
**A:** This project is designed for education. For production:
- Add proper testing
- Implement HTTPS/SSL
- Use production database (MongoDB Atlas)
- Deploy smart contract to testnet/mainnet
- Add monitoring and logging
- Implement rate limiting
- Add email verification
- Enhance error handling

### Q42: How do I debug issues?
**A:**
1. Check browser console (F12)
2. Check backend terminal output
3. Check MongoDB for data issues
4. Check Ganache for blockchain issues
5. Use console.log() statements
6. Use React DevTools

### Q43: Can I use a different database?
**A:** Yes! You can replace MongoDB with:
- PostgreSQL
- MySQL
- SQLite
Just update the backend models and connection logic.

### Q44: Can I add more networks besides Ganache?
**A:** Yes! Modify the web3.ts service to support:
- Ethereum Mainnet
- Testnets (Goerli, Sepolia)
- Polygon
- Binance Smart Chain
- etc.

### Q45: How do I add unit tests?
**A:** Install testing libraries:
```bash
# Frontend
npm install --save-dev @testing-library/react

# Backend
npm install --save-dev jest supertest

# Smart Contract
npm install --save-dev hardhat @nomiclabs/hardhat-waffle
```
Then write tests in `__tests__` folders.

---

## Advanced Questions

### Q46: What gas fees are involved?
**A:** On Ganache, gas is free (simulated). On real networks:
- Sending transaction: ~21,000 gas + contract execution
- Contract deployment: ~500,000 - 1,000,000 gas
Gas prices vary based on network congestion.

### Q47: Can I implement token transfers (ERC-20)?
**A:** Yes! You would need to:
1. Create an ERC-20 smart contract
2. Deploy it to Ganache
3. Modify frontend to interact with token contract
4. Add token balance display
5. Implement token transfer function

### Q48: How scalable is this application?
**A:** Current limitations:
- Single MongoDB instance
- No caching
- No load balancing
- Local blockchain only

For scalability:
- Add Redis for caching
- Use MongoDB replicas
- Implement CDN for frontend
- Use load balancer for backend
- Deploy to real blockchain

### Q49: Can I add email notifications?
**A:** Yes! Integrate an email service:
- SendGrid
- AWS SES
- Nodemailer with SMTP

Add to backend for:
- Registration confirmation
- Transaction alerts
- Password reset

### Q50: How do I contribute to this project?
**A:** This is an educational project, but you can:
1. Fork the repository
2. Make improvements
3. Share with others
4. Use as a learning resource
5. Build upon it for your own projects

---

## Common Scenarios

### Scenario 1: I want to test with multiple users
**Solution:**
1. Import 3-4 Ganache accounts to MetaMask
2. Register each account as a different user
3. Login with each user separately
4. Send transactions between them
5. View transaction history from both sides

### Scenario 2: I want to reset everything
**Solution:**
1. Stop all servers (backend, frontend)
2. Restart Ganache (generates new accounts)
3. Drop MongoDB database: `use chainsecure; db.dropDatabase()`
4. Redeploy smart contract: `cd blockchain && npm run deploy`
5. Restart backend and frontend
6. Re-import new Ganache accounts to MetaMask

### Scenario 3: I want to demo this project
**Solution:**
1. Ensure all services are running
2. Open multiple browser windows
3. Have one as admin, one as user
4. Show registration with wallet verification
5. Demonstrate sending transaction
6. Show transaction history
7. Display admin dashboard

---

## Quick Reference

### Default Credentials
- **Admin Email:** admin@chainsecure.com
- **Admin Password:** admin123

### Default Ports
- **Frontend:** 3000
- **Backend:** 5000
- **MongoDB:** 27017
- **Ganache:** 7545

### Important URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health

### Key Commands
```bash
# Start MongoDB
net start MongoDB  # Windows
sudo systemctl start mongod  # Linux

# Deploy Contract
cd blockchain && npm run deploy

# Start Backend
cd backend && npm run dev

# Start Frontend
cd frontend && npm start
```

---

## Still Have Questions?

1. **Check Documentation:**
   - README.md - Complete guide
   - QUICKSTART.md - Quick setup
   - DEVELOPMENT.md - Developer notes
   - VERIFICATION.md - Setup checklist

2. **Review Code:**
   - All code is well-commented
   - Check specific files for implementation details

3. **Debug:**
   - Check console logs
   - Review error messages
   - Test step-by-step

---

**Last Updated:** January 2026
**Project Version:** 1.0.0

*If your question isn't answered here, review the comprehensive README.md file!*
