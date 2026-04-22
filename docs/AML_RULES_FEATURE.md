# AML Rules Feature - Implementation Guide

## ✅ What Has Been Implemented

### Backend Components

#### 1. **AML Rule Model** (`backend/models/AMLRule.js`)
- Complete MongoDB schema for AML rules
- Fields include:
  - `name` - Rule name
  - `description` - Detailed description
  - `ruleType` - Type of rule (transaction_limit, velocity, pattern, etc.)
  - `severity` - Low, Medium, High, Critical
  - `isActive` - Toggle to enable/disable rules
  - `parameters` - Flexible parameters for different rule types
  - `action` - Alert, Block, Review, Flag
  - `priority` - 1-10 priority level
  - `triggeredCount` - How many times the rule has been triggered
  - `createdBy` & `updatedBy` - User tracking

#### 2. **AML Routes** (`backend/routes/aml.js`)
Complete REST API endpoints:
- `GET /api/aml/rules` - Get all AML rules
- `GET /api/aml/rules/:id` - Get single rule
- `POST /api/aml/rules` - Create new rule
- `PUT /api/aml/rules/:id` - Update existing rule
- `DELETE /api/aml/rules/:id` - Delete rule
- `PATCH /api/aml/rules/:id/toggle` - Toggle rule active status
- `POST /api/aml/rules/seed` - Seed 10 default rules

#### 3. **Server Configuration** (`backend/server.js`)
- Added AML routes to Express server
- Route path: `/api/aml`

### Frontend Components

#### 1. **Admin Dashboard Updates** (`frontend/src/pages/AdminDashboard.tsx`)
- New AML Rules tab in navigation
- Complete CRUD interface for managing rules
- Features:
  - Grid view of all AML rules
  - Create new rule modal
  - Edit existing rules
  - Delete rules with confirmation
  - Toggle rules on/off
  - Seed default rules button
  - Empty state with quick actions

#### 2. **Styling** (`frontend/src/pages/AdminDashboard.css`)
- Professional card-based layout
- Color-coded severity badges
- Action buttons with hover effects
- Responsive modal for create/edit
- Mobile-responsive design

## 🎯 Pre-seeded AML Rules (10 Rules)

1. **Large Transaction Alert** (High Severity)
   - Detects transactions over $10,000
   - Action: Alert
   - Priority: 9

2. **Rapid Fire Transactions** (Medium Severity)
   - Detects more than 10 transactions in 1 hour
   - Action: Review
   - Priority: 7

3. **Structuring Pattern Detection** (Critical Severity)
   - Identifies transactions just below $10,000 threshold
   - Action: Block
   - Priority: 10

4. **High-Risk Geographic Location** (High Severity)
   - Flags transactions from sanctioned countries
   - Action: Block
   - Priority: 9

5. **Suspicious Round Number Pattern** (Low Severity)
   - Detects exact round numbers
   - Action: Flag
   - Priority: 3

6. **New Account High Activity** (Medium Severity)
   - Alerts for new accounts (<7 days) with high transactions
   - Action: Review
   - Priority: 6

7. **PEP Check** (High Severity)
   - Enhanced due diligence for Politically Exposed Persons
   - Action: Review
   - Priority: 8

8. **OFAC Sanctions List Check** (Critical Severity)
   - Verifies against OFAC SDN list
   - Action: Block
   - Priority: 10

9. **Daily Transaction Limit** (Medium Severity)
   - Monitors daily volume (max $50,000)
   - Action: Alert
   - Priority: 5

10. **Unusual Time Pattern** (Low Severity)
    - Flags transactions during 2 AM - 5 AM
    - Action: Flag
    - Priority: 4

## 🚀 How to Use

### 1. Access the AML Rules Tab
1. Log in as admin (admin@chainsecure.com / admin123)
2. Navigate to Admin Dashboard
3. Click on "🛡️ AML Rules" tab

### 2. Seed Default Rules (First Time Setup)
1. If no rules exist, you'll see an empty state
2. Click "🌱 Seed Default Rules" button
3. This creates all 10 pre-configured AML rules

### 3. Create a New Rule
1. Click "➕ Create New Rule" button
2. Fill in the form:
   - **Rule Name**: Descriptive name
   - **Description**: What the rule detects
   - **Rule Type**: Select from dropdown (transaction_limit, velocity, pattern, etc.)
   - **Severity**: Low, Medium, High, or Critical
   - **Action**: Alert, Block, Review, or Flag
   - **Priority**: 1-10 (10 being highest)
   - **Parameters**: Optional threshold values
   - **Active Status**: Toggle to enable immediately
3. Click "Create Rule"

### 4. Edit an Existing Rule
1. Find the rule card
2. Click the ✏️ (edit) button
3. Modify any fields
4. Click "Update Rule"

### 5. Toggle Rule Status
1. Find the rule card
2. Click the toggle button (✓ or ○)
3. Rule will be activated/deactivated immediately

### 6. Delete a Rule
1. Find the rule card
2. Click the 🗑️ (delete) button
3. Confirm the deletion

## 📊 Rule Card Information

Each AML rule card displays:
- **Rule Name** with severity badge
- **Description** of what it detects
- **Rule Type** (e.g., transaction_limit, velocity)
- **Action** (Alert, Block, Review, Flag)
- **Priority** level (1-10)
- **Triggered Count** (how many times it's been triggered)
- **Status** indicator (Active/Inactive)
- **Last Updated** timestamp
- **Action buttons** (Toggle, Edit, Delete)

## 🎨 Visual Indicators

### Severity Colors:
- **Low** - Blue badge
- **Medium** - Yellow badge
- **High** - Orange badge
- **Critical** - Red badge

### Action Colors:
- **Alert** - Blue
- **Block** - Red
- **Review** - Yellow
- **Flag** - Purple

### Status:
- **Active** - Green dot (🟢)
- **Inactive** - Red dot (🔴) + faded card

## 🔧 API Endpoints Reference

### Get All Rules
```http
GET /api/aml/rules
Authorization: Bearer <admin_token>
```

### Create Rule
```http
POST /api/aml/rules
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "My Custom Rule",
  "description": "Detects suspicious activity",
  "ruleType": "transaction_limit",
  "severity": "high",
  "action": "alert",
  "priority": 8,
  "isActive": true,
  "parameters": {
    "threshold": 5000,
    "maxAmount": 10000
  }
}
```

### Update Rule
```http
PUT /api/aml/rules/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Rule Name",
  "severity": "critical"
}
```

### Delete Rule
```http
DELETE /api/aml/rules/:id
Authorization: Bearer <admin_token>
```

### Toggle Rule Status
```http
PATCH /api/aml/rules/:id/toggle
Authorization: Bearer <admin_token>
```

### Seed Default Rules
```http
POST /api/aml/rules/seed
Authorization: Bearer <admin_token>
```

## 📱 Mobile Responsive

The AML Rules interface is fully responsive:
- Card grid adapts to screen size
- Modal becomes full-screen on mobile
- Touch-friendly buttons
- Scrollable content

## 🔐 Security

- All endpoints require admin authentication
- Only admins can access AML rules
- User tracking (createdBy, updatedBy)
- Token-based authorization

## 🎉 Next Steps

The AML rules are now set up! Future enhancements could include:
- Real-time transaction monitoring against rules
- Rule trigger notifications
- Rule analytics dashboard
- Machine learning-based rule suggestions
- Export/import rules functionality
- Rule testing/simulation

## 📝 Notes

- Rules are stored in MongoDB
- Each rule can be individually toggled without deletion
- Priority determines execution order (higher = first)
- Parameters are flexible and rule-type specific
- All changes are tracked with timestamps
