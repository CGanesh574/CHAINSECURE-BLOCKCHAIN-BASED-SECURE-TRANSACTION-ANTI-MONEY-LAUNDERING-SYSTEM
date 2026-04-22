# How to View KYC Documents in MongoDB

## Document Storage Structure

KYC documents are stored in MongoDB in the `kycs` collection with the following structure:

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (reference to users collection)",
  "documentType": "aadhaar/pan/driving_license/passport/voter_id",
  "documentNumber": "String",
  "documentImage": {
    "data": "Buffer (binary data)",
    "contentType": "image/jpeg or image/png or application/pdf"
  },
  "status": "PENDING/APPROVED/REJECTED",
  "rejectionReason": "String (if rejected)",
  "reviewedBy": "ObjectId (admin who reviewed)",
  "reviewedAt": "Date",
  "submittedAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## How to View Documents in MongoDB

### Option 1: Using MongoDB Compass (GUI)

1. **Open MongoDB Compass**
2. **Connect to your database** using your connection string
3. **Navigate to the database** (e.g., `chainsecure` or `test`)
4. **Click on the `kycs` collection**
5. **Find the document** you want to view
6. **Look at the `documentImage` field**:
   - You'll see `{ data: Binary, contentType: 'image/jpeg' }`
   - The actual image is stored as binary data

**To Extract and View the Image:**

MongoDB Compass doesn't directly display binary image data. You need to:
1. Copy the document ID
2. Use the backend API endpoint: `GET /api/kyc/admin/document/:id`
3. This will serve the image properly

### Option 2: Using MongoDB Shell

```bash
# Connect to MongoDB
mongosh "your_connection_string"

# Switch to your database
use chainsecure

# Find all KYC documents
db.kycs.find().pretty()

# Find a specific KYC by ID
db.kycs.findOne({ _id: ObjectId("your_kyc_id") })

# Check document size
db.kycs.findOne(
  { _id: ObjectId("your_kyc_id") },
  { "documentImage.data": 0 }
).documentImage.contentType

# Get document info without the binary data
db.kycs.aggregate([
  {
    $project: {
      userId: 1,
      documentType: 1,
      documentNumber: 1,
      status: 1,
      contentType: "$documentImage.contentType",
      dataSize: { $binarySize: "$documentImage.data" },
      submittedAt: 1
    }
  }
])
```

### Option 3: Using the Admin Dashboard (Recommended)

**This is the easiest way to view KYC documents:**

1. **Login as admin** (admin@chainsecure.com)
2. **Navigate to Admin Dashboard**
3. **Click on "KYC Management" tab**
4. **Click "View" button** next to any KYC submission
5. **The document will open in a modal**
   - Works for images (JPG, PNG)
   - Works for PDFs (opens in new tab or downloads)

### Option 4: Export Document from MongoDB

If you need to extract the actual file:

```javascript
// In MongoDB shell or script
const kyc = db.kycs.findOne({ _id: ObjectId("your_kyc_id") });
const fs = require('fs');

// Write to file
fs.writeFileSync(
  'document.jpg', 
  Buffer.from(kyc.documentImage.data.buffer)
);
```

### Option 5: Using Postman/API

```bash
# Get document via API
GET http://localhost:5000/api/kyc/admin/document/:kycId
Headers:
  Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

## Verifying Documents are Stored Correctly

### Check if documents exist:

```bash
# Count documents with images
db.kycs.countDocuments({ "documentImage.data": { $exists: true } })

# Check document sizes
db.kycs.aggregate([
  {
    $project: {
      documentType: 1,
      status: 1,
      sizeInBytes: { $binarySize: "$documentImage.data" },
      sizeInKB: { $divide: [{ $binarySize: "$documentImage.data" }, 1024] },
      contentType: "$documentImage.contentType"
    }
  }
])

# Find documents submitted today
db.kycs.find({
  submittedAt: {
    $gte: new Date(new Date().setHours(0,0,0,0))
  }
}).pretty()
```

## Troubleshooting

### Documents Not Showing in Admin Dashboard

1. **Check backend logs** for errors when accessing `/api/kyc/admin/document/:id`
2. **Verify the KYC ID** is correct
3. **Check if documentImage.data exists** in MongoDB
4. **Verify JWT token** is valid for admin user
5. **Check Content-Type** header in response

### Document Size Issues

```bash
# Check if any documents exceed 16MB (MongoDB limit)
db.kycs.find({
  $expr: { 
    $gt: [{ $binarySize: "$documentImage.data" }, 16777216] 
  }
})
```

## Security Notes

⚠️ **Important**: 
- KYC documents contain sensitive personal information (PII)
- Only admins should have access to view documents
- Documents are stored encrypted in MongoDB
- Always use secure connections (SSL/TLS)
- Implement proper access controls
- Audit all document access

## Document Formats Supported

✅ **Supported Formats:**
- JPEG/JPG images (`image/jpeg`)
- PNG images (`image/png`)
- PDF documents (`application/pdf`)

📏 **File Size Limit:**
- Maximum: 5MB per document
- Enforced by Multer middleware

## Summary

**Best way to view documents:**
1. Use the **Admin Dashboard** (easiest)
2. Use the **API endpoint** with proper authentication
3. MongoDB Compass for metadata only (not actual images)
4. MongoDB Shell for queries and statistics

The actual image/PDF data is stored as binary (Buffer) in MongoDB, so you cannot directly "view" it in MongoDB clients - you must use the backend API or admin interface to properly render the documents.
