# Quick Start Guide - Testing Merchandise Payment Approval Workflow

## Setup

1. **Start Backend Server:**
   ```bash
   cd backend
   npm install  # If not already done
   npm start    # or: node server.js
   ```

2. **Start Frontend Server:**
   ```bash
   cd frontend
   npm install  # If not already done
   npm run dev  # or: npm run build
   ```

3. **Access Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Test Flow

### Step 1: Participant - Create Account and Register for Event

1. Go to http://localhost:5173/signup
2. Create a participant account (username, email, password)
3. Complete reCAPTCHA verification
4. Go to http://localhost:5173/browse → Find a merchandise event
5. Click on event → Click "Register" 
6. Fill registration form and submit
7. Verify registration successful

### Step 2: Participant - Order Merchandise

1. After successful registration, you'll see event in dashboard
2. Click the event card → Look for "Order Merchandise" button (if merchandise event)
3. OR navigate directly to: http://localhost:5173/merchandise/checkout/{eventId}
   - Replace {eventId} with the actual event ID from the URL

**On Quantity Selection Screen:**
- Enter quantity: 2
- Total amount should show: ₹200
- Click "Proceed to Payment"

**On Payment Proof Upload Screen:**
- Payment Method: Select "UPI" (or any option)
- Upload a screenshot/image from your device
- Should show preview of selected image
- Click "Submit for Approval"

**On Confirmation Screen:**
- Verify message: "Order Submitted Successfully!"
- Status shows: "Pending Approval"
- Click "View My Orders" to see order in dashboard

### Step 3: Verify Participant's Order Status

1. In participant dashboard, check if there's a merchandise tab or orders section
2. Should see order with status: **Pending Approval**
3. Shows order ID, amount (₹200), payment method, and upload date

### Step 4: Organizer - Approve Payment

1. Logout or open new incognito window
2. Login as organizer (create one if needed)
3. Go to Organizer Dashboard: http://localhost:5173/organizer/dashboard
4. Click **"Payment Approvals"** tab (newly added)

**On Payment Approvals Tab:**
- Should see table with pending payments
- Columns: Order ID, Participant Name, Email, Event, Amount, Method, Proof, Date
- Check "Payment Proof" link (should open the uploaded image)

**To Approve Payment:**
- Click green **"Approve"** button
- Should see success message: "Payment approved successfully"
- Payment status immediately changes

**To Reject Payment (Test):**
- Click red **"Reject"** button
- Modal popup appears with rejection reason textarea
- Enter reason: "Invalid payment proof"
- Click "Confirm"
- Should see error state disappear, participant receives rejection email

### Step 5: Verify Changes After Approval

1. Participant Dashboard:
   - Order status changes to: **Approved**
   - Order is marked: **Successful**

2. Organizer Dashboard:
   - Payment disappears from "Pending" list
   - Pagination updates if needed

## Expected Behavior

### Success Path:
✅ Participant creates order → ✅ Uploads proof → ✅ Organizer approves → ✅ Order marked Successful

### Rejection Path:
✅ Participant creates order → ✅ Uploads proof → ✅ Organizer rejects → ✅ Participant receives email

## Common Issues & Solutions

### Issue: "Order not found" error
**Solution:** Verify orderId is correct, check MongoDB that order exists
```bash
# Check in MongoDB
use your_db_name
db.orders.findOne()
```

### Issue: Payment proof doesn't upload
**Solution:** 
- Ensure image file is selected
- Check file size (should be < 5MB)
- Browser console should show no errors

### Issue: "Payment not found" error during approval
**Solution:** 
- Verify payment record was created when proof uploaded
- Check Payment collection in MongoDB:
```bash
db.payments.find()
```

### Issue: Organizer doesn't see Payment Approvals tab
**Solution:**
- Verify user is logged in as organizer (not participant/admin)
- Clear browser cache: Ctrl+Shift+Delete
- Verify OrganizerDashboard component imported PaymentApprovalTab

### Issue: 401 Unauthorized errors in console
**Solution:**
- Verify JWT token is stored in localStorage
- Check api.js has axios interceptor for Authorization header
- Re-login if token expired

## Database Verification

**Check Orders Created:**
```mongodb
db.orders.find().pretty()
```

**Check Payments Uploaded:**
```mongodb
db.payments.find().pretty()
```

**Check Security Events (optional):**
```mongodb
db.securityevents.find({ details: /payment/i }).pretty()
```

## API Endpoints (For Manual Testing with Postman)

### Create Order
```
POST http://localhost:5000/api/payments/orders
Headers: Authorization: Bearer {token}
Body: { "eventId": "...", "quantity": 2 }
Response: { "orderId": "...", "totalAmount": 200 }
```

### Upload Payment Proof
```
POST http://localhost:5000/api/payments/payment/upload
Headers: Authorization: Bearer {token}
Body: { "orderId": "...", "paymentMethod": "UPI", "paymentProofImage": "data:image/..." }
```

### Get Pending Payments (Organizer)
```
GET http://localhost:5000/api/payments/payments/pending?page=1&limit=20
Headers: Authorization: Bearer {token}
```

### Approve Payment
```
POST http://localhost:5000/api/payments/payments/{paymentId}/approve
Headers: Authorization: Bearer {token}
Body: {}
```

### Reject Payment
```
POST http://localhost:5000/api/payments/payments/{paymentId}/reject
Headers: Authorization: Bearer {token}
Body: { "rejectionReason": "Invalid proof" }
```

## Troubleshooting Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected and accessible
- [ ] Environment variables configured (.env files)
- [ ] JWT token interceptor working (api.js)
- [ ] PaymentApprovalTab imported in OrganizerDashboard
- [ ] MerchandiseCheckout imported in App.jsx
- [ ] Payment routes mounted in app.js
- [ ] User has appropriate role (participant/organizer)
- [ ] Network tab shows API requests with 200/201 status

## Next Steps (Optional Enhancements)

1. Wire QR generation into approvePayment() - calls generateTicket()
2. Add HTML email templates for rejections
3. Implement merchandise inventory/stock management
4. Add participant order history view with full details
5. Create admin dashboard to monitor all orders
6. Add refund functionality for rejected payments
7. Implement payment method specific instructions
