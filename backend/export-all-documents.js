const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const KYC = require('./models/KYC');
const User = require('./models/User');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'kyc');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function exportAllDocuments() {
  try {
    console.log('\n📥 Exporting all KYC documents from MongoDB...\n');
    
    const kycs = await KYC.find({ 'documentImage.data': { $exists: true } })
      .populate('userId', 'name email');
    
    if (kycs.length === 0) {
      console.log('❌ No KYC documents found in database');
      mongoose.disconnect();
      process.exit(0);
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const kyc of kycs) {
      try {
        // Determine file extension
        let extension;
        if (kyc.documentImage.contentType === 'application/pdf') {
          extension = 'pdf';
        } else if (kyc.documentImage.contentType.includes('jpeg') || kyc.documentImage.contentType.includes('jpg')) {
          extension = 'jpg';
        } else if (kyc.documentImage.contentType === 'image/png') {
          extension = 'png';
        } else {
          extension = kyc.documentImage.contentType.split('/')[1] || 'bin';
        }
        
        // Create filename: email_documentType_kycId.extension
        const sanitizedEmail = kyc.userId.email.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${sanitizedEmail}_${kyc.documentType}_${kyc._id}.${extension}`;
        const filepath = path.join(uploadsDir, filename);
        
        // Write file
        fs.writeFileSync(filepath, kyc.documentImage.data);
        
        console.log(`✅ ${successCount + 1}. Exported: ${filename}`);
        console.log(`   User: ${kyc.userId.name} (${kyc.userId.email})`);
        console.log(`   Type: ${kyc.documentType.toUpperCase()}`);
        console.log(`   Status: ${kyc.status}`);
        console.log(`   Size: ${(kyc.documentImage.data.length / 1024).toFixed(2)} KB`);
        console.log(`   Path: ${filepath}\n`);
        
        successCount++;
      } catch (err) {
        console.error(`❌ Failed to export document for ${kyc.userId.email}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n' + '═'.repeat(70));
    console.log(`\n📊 Export Summary:`);
    console.log(`   ✅ Successfully exported: ${successCount} documents`);
    console.log(`   ❌ Failed: ${errorCount} documents`);
    console.log(`   📂 Location: ${uploadsDir}`);
    console.log(`\n💡 To view all documents, run:`);
    console.log(`   explorer ${uploadsDir}`);
    console.log('\n' + '═'.repeat(70) + '\n');
    
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
    process.exit(1);
  }
}

exportAllDocuments();
