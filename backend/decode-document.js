const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const KYC = require('./models/KYC');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function decodeDocument(kycId) {
  try {
    console.log('🔍 Looking for KYC document with ID:', kycId);
    
    const kyc = await KYC.findById(kycId);
    
    if (!kyc) {
      console.log('❌ KYC document not found');
      process.exit(1);
    }
    
    if (!kyc.documentImage || !kyc.documentImage.data) {
      console.log('❌ No document image data found');
      process.exit(1);
    }
    
    console.log('\n📄 Document Information:');
    console.log('   Content-Type:', kyc.documentImage.contentType);
    console.log('   Size:', kyc.documentImage.data.length, 'bytes');
    console.log('   Size:', (kyc.documentImage.data.length / 1024).toFixed(2), 'KB');
    
    // Determine file extension from content type
    let extension;
    if (kyc.documentImage.contentType === 'application/pdf') {
      extension = 'pdf';
    } else if (kyc.documentImage.contentType === 'image/jpeg' || kyc.documentImage.contentType === 'image/jpg') {
      extension = 'jpg';
    } else if (kyc.documentImage.contentType === 'image/png') {
      extension = 'png';
    } else {
      extension = kyc.documentImage.contentType.split('/')[1] || 'bin';
    }
    
    const filename = `decoded_${kycId}.${extension}`;
    
    // Write the buffer to a file (this DECODES the binary data)
    fs.writeFileSync(filename, kyc.documentImage.data);
    
    console.log('\n✅ Document decoded and saved as:', filename);
    console.log('📂 Location:', __dirname + '\\' + filename);
    console.log('\n💡 Open it with your default viewer or run:');
    console.log('   Start-Process', filename);
    
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
    process.exit(1);
  }
}

// Get KYC ID from command line argument
const kycId = process.argv[2];
if (!kycId) {
  console.log('❌ Usage: node decode-document.js <KYC_ID>');
  console.log('\n💡 To get KYC IDs, run: node list-documents.js');
  process.exit(1);
}

decodeDocument(kycId);
