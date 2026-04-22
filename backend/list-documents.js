const mongoose = require('mongoose');
require('dotenv').config();

const KYC = require('./models/KYC');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function listDocuments() {
  try {
    console.log('\n📋 All KYC Documents in Database:\n');
    
    const kycs = await KYC.find()
      .populate('userId', 'name email walletAddress')
      .sort({ createdAt: -1 });
    
    if (kycs.length === 0) {
      console.log('❌ No KYC documents found');
      mongoose.disconnect();
      process.exit(0);
    }
    
    kycs.forEach((kyc, index) => {
      console.log(`\n${index + 1}. KYC ID: ${kyc._id}`);
      console.log(`   User: ${kyc.userId.name} (${kyc.userId.email})`);
      console.log(`   Wallet: ${kyc.userId.walletAddress}`);
      console.log(`   Document Type: ${kyc.documentType.toUpperCase()}`);
      console.log(`   Document Number: ${kyc.documentNumber}`);
      console.log(`   Status: ${kyc.status}`);
      console.log(`   Submitted: ${new Date(kyc.submittedAt).toLocaleString()}`);
      
      if (kyc.documentImage && kyc.documentImage.data) {
        console.log(`   File Type: ${kyc.documentImage.contentType}`);
        console.log(`   File Size: ${(kyc.documentImage.data.length / 1024).toFixed(2)} KB`);
        console.log(`   Has Document: ✅ YES`);
      } else {
        console.log(`   Has Document: ❌ NO`);
      }
      
      if (kyc.rejectionReason) {
        console.log(`   Rejection Reason: ${kyc.rejectionReason}`);
      }
      
      console.log(`\n   📥 To decode this document, run:`);
      console.log(`   node decode-document.js ${kyc._id}`);
      console.log('   ' + '─'.repeat(60));
    });
    
    console.log(`\n\n📊 Total Documents: ${kycs.length}`);
    console.log(`   PENDING: ${kycs.filter(k => k.status === 'PENDING').length}`);
    console.log(`   APPROVED: ${kycs.filter(k => k.status === 'APPROVED').length}`);
    console.log(`   REJECTED: ${kycs.filter(k => k.status === 'REJECTED').length}`);
    
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
    process.exit(1);
  }
}

listDocuments();
