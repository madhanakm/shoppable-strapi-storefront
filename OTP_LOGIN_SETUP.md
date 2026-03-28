# OTP Login - Quick Setup Guide

## ✅ Frontend Implementation Complete

### What's Done:
1. ✅ OTPLogin page created (`/src/pages/OTPLogin.tsx`)
2. ✅ Route added to App.tsx (`/otp-login`)
3. ✅ OTP login button added to Login page
4. ✅ Services updated (ecom-users.ts, backend-sms.ts)

### What You See:
- Login page now has "Login with OTP" button
- Clicking it takes you to `/otp-login`
- Two-step OTP verification flow
- 5-minute countdown timer
- Resend OTP with cooldown
- Tamil language support

## 🔧 Backend Setup Required

### Step 1: Add Fields to Strapi ecom-users

Go to Strapi Admin → Content Types → ecom-users

Add these 3 fields:

```
1. loginOtp
   Type: Text
   Label: "Login OTP"
   
2. loginOtpExpiresAt
   Type: DateTime
   Label: "Login OTP Expires At"
   
3. loginOtpAttempts
   Type: Number
   Label: "Login OTP Attempts"
   Default: 0
```

### Step 2: Update SMS Controller

In your Strapi backend, update the SMS sending endpoint to handle different OTP types:

```javascript
// In your send-sms controller
module.exports = {
  async send(ctx) {
    const { mobile, otp, type = 'registration' } = ctx.request.body.data;
    
    const messages = {
      registration: `Your OTP for registration to Dharani Herbbals is ${otp}\nValid for 30 minutes. Do not share this OTP.\n- Dharani Herbbals`,
      'password-reset': `Your OTP for password reset to Dharani Herbbals is ${otp}\nValid for 30 minutes. Do not share this OTP.\n- Dharani Herbbals`,
      login: `Your OTP for login to Dharani Herbbals is ${otp}\nValid for 5 minutes. Do not share this OTP.\n- Dharani Herbbals`
    };
    
    const message = messages[type] || messages.registration;
    
    // Send SMS via your SMS API
    // ... rest of implementation
  }
};
```

## 🧪 Testing

1. Go to `http://localhost:8080/login`
2. Click "Login with OTP" button
3. Enter a registered phone number
4. Check SMS for OTP
5. Enter OTP and verify
6. Should be logged in

## 📱 User Flow

```
Login Page
    ↓
Click "Login with OTP"
    ↓
Enter Phone Number
    ↓
Receive OTP via SMS
    ↓
Enter 6-digit OTP
    ↓
Logged In ✅
```

## 🔐 Security Features

- ✅ OTP expires in 5 minutes
- ✅ Max 5 failed attempts
- ✅ Resend cooldown (5 minutes)
- ✅ OTP cleared after verification
- ✅ User marked as verified
- ✅ Attempt counter reset on success

## 📋 Checklist

- [ ] Added 3 fields to ecom-users in Strapi
- [ ] Updated SMS controller to handle `type` parameter
- [ ] Tested OTP sending
- [ ] Tested OTP verification
- [ ] Tested resend OTP
- [ ] Tested max attempts limit
- [ ] Tested user login after OTP verification
- [ ] Tested Tamil language support
- [ ] Tested mobile responsiveness

## 🚀 Files Modified

1. `/src/pages/Login.tsx` - Added OTP login button
2. `/src/pages/OTPLogin.tsx` - New OTP login page
3. `/src/App.tsx` - Added /otp-login route
4. `/src/services/ecom-users.ts` - Added OTP login fields
5. `/src/services/backend-sms.ts` - Added type parameter

## 🎯 Next Steps

1. Add fields to Strapi ecom-users
2. Update SMS controller
3. Test the flow
4. Deploy to production

## 📞 Support

If you have issues:
1. Check that fields are added to ecom-users
2. Check SMS API is working
3. Check that OTP is being sent
4. Check browser console for errors
5. Check Strapi logs for API errors

## 🎨 Customization

To customize OTP expiry time, edit `/src/pages/OTPLogin.tsx`:

```typescript
// Line ~80: Change 5 * 60 * 1000 to desired milliseconds
const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
```

To customize SMS message, update your Strapi SMS controller.

---

**Status**: ✅ Frontend Ready | ⏳ Awaiting Backend Setup
