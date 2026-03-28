# OTP Login Implementation Guide

## Overview
OTP (One-Time Password) Login has been implemented alongside existing OTP features for registration and password reset. This provides users with a secure, passwordless login option.

## Database Schema Changes

### ecom-users Collection - New Fields

Add these fields to your Strapi `ecom-users` content type:

#### Login OTP Fields (Separate from Password Reset OTP)
```
1. loginOtp (Text/String)
   - Stores the 6-digit OTP for login
   - Cleared after successful verification
   - Label: "Login OTP"

2. loginOtpExpiresAt (DateTime)
   - Timestamp when login OTP expires (5 minutes)
   - Label: "Login OTP Expires At"

3. loginOtpAttempts (Number/Integer)
   - Tracks failed OTP verification attempts
   - Resets to 0 on successful verification
   - Max 5 attempts allowed
   - Label: "Login OTP Attempts"
```

#### Existing Fields (Already Present)
```
- otp (Text) - For password reset
- otpExpiresAt (DateTime) - For password reset
- isVerified (Boolean) - User verification status
```

### Why Separate OTP Fields?
- **Security**: Prevents confusion between login and password reset OTPs
- **Tracking**: Separate attempt counters for each flow
- **Flexibility**: Different expiry times if needed (5 min for login, 30 min for password reset)

## API Endpoint Configuration

### Backend SMS Endpoint
The existing `/send-sms` endpoint now supports a `type` parameter:

```typescript
POST /send-sms
{
  "data": {
    "mobile": "9942492001",
    "otp": "123456",
    "type": "login" // "registration", "password-reset", or "login"
  }
}
```

### SMS Template for Login OTP
Use this template in your backend SMS service:

```
Your OTP for login to Dharani Herbbals is #field1#
Valid for 5 minutes. Do not share this OTP.
- Dharani Herbbals
```

**API URL Format:**
```
http://smsc.biz/httpapi/send?username=sundarppy@gmail.com&password=null&sender_id=DHHERB&route=T&phonenumber={phone}&message=Your%20OTP%20for%20login%20to%20Dharani%20Herbbals%20is%20%23field1%23%0D%0AValid%20for%205%20minutes.%20Do%20not%20share%20this%20OTP.%0D%0A-%20Dharani%20Herbbals
```

## Frontend Implementation

### New Page: OTPLogin.tsx
Location: `/src/pages/OTPLogin.tsx`

**Features:**
- Two-step verification process
- Phone number input
- 6-digit OTP input with auto-formatting
- 5-minute countdown timer
- Resend OTP functionality (with cooldown)
- Attempt tracking (max 5 attempts)
- Tamil language support
- Responsive design

**Flow:**
1. User enters phone number
2. System sends OTP via SMS
3. User enters 6-digit OTP
4. System verifies OTP and logs in user
5. Redirects to home page

### Updated Services

#### ecom-users.ts
```typescript
export interface EcomUser {
  // ... existing fields
  
  // Password Reset OTP
  otp?: string;
  otpExpiresAt?: string;
  
  // Login OTP (NEW)
  loginOtp?: string;
  loginOtpExpiresAt?: string;
  loginOtpAttempts?: number;
  
  // Verification
  isVerified?: boolean;
}
```

#### backend-sms.ts
```typescript
export const sendOTPViaSMS = async (
  mobile: string, 
  otp: string, 
  type: 'registration' | 'password-reset' | 'login' = 'registration'
): Promise<boolean>
```

## Routing Setup

Add this route to your main router configuration:

```typescript
// In your router file (e.g., App.tsx or main router)
import OTPLogin from '@/pages/OTPLogin';

// Add to routes
{
  path: '/otp-login',
  element: <OTPLogin />
}
```

## Security Features

1. **OTP Expiry**: 5 minutes (configurable)
2. **Attempt Limiting**: Maximum 5 failed attempts
3. **Rate Limiting**: Resend cooldown (5 minutes)
4. **Secure Storage**: OTP stored in database, never in localStorage
5. **Auto-Cleanup**: OTP cleared after successful verification
6. **Verification Status**: User marked as verified after successful login

## User Flow Comparison

### Registration OTP
- Field: `otp`, `otpExpiresAt`
- Duration: 30 minutes
- Purpose: Email verification during signup

### Password Reset OTP
- Field: `otp`, `otpExpiresAt`
- Duration: 30 minutes
- Purpose: Verify identity before password reset

### Login OTP (NEW)
- Field: `loginOtp`, `loginOtpExpiresAt`, `loginOtpAttempts`
- Duration: 5 minutes
- Purpose: Passwordless login

## Testing Checklist

- [ ] User can request OTP with valid phone number
- [ ] OTP is sent via SMS successfully
- [ ] User can verify OTP within 5 minutes
- [ ] OTP expires after 5 minutes
- [ ] User cannot verify after 5 failed attempts
- [ ] Resend OTP works with cooldown
- [ ] User is logged in after successful verification
- [ ] User is redirected to home page
- [ ] Tamil language support works
- [ ] Mobile responsive design works
- [ ] Error messages display correctly

## Integration with Existing Auth

The OTP login integrates seamlessly with existing authentication:

```typescript
// After successful OTP verification
await login({
  id: userId,
  name: user.name,
  email: user.email,
  phone: user.phone,
  userType: user.userType || 'customer',
  isVerified: true
});
```

## Backend Implementation (Strapi)

### Create Custom Route for SMS Sending

In your Strapi backend, create a custom route that handles different OTP types:

```javascript
// routes/send-sms.js
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/send-sms',
      handler: 'send-sms.send',
      config: {
        policies: [],
      },
    },
  ],
};
```

### Controller Implementation

```javascript
// controllers/send-sms.js
module.exports = {
  async send(ctx) {
    const { mobile, otp, type = 'registration' } = ctx.request.body.data;
    
    // Different messages for different types
    const messages = {
      registration: `Your OTP for registration to Dharani Herbbals is ${otp}\nValid for 30 minutes. Do not share this OTP.\n- Dharani Herbbals`,
      'password-reset': `Your OTP for password reset to Dharani Herbbals is ${otp}\nValid for 30 minutes. Do not share this OTP.\n- Dharani Herbbals`,
      login: `Your OTP for login to Dharani Herbbals is ${otp}\nValid for 5 minutes. Do not share this OTP.\n- Dharani Herbbals`
    };
    
    const message = messages[type] || messages.registration;
    
    // Send via SMS API
    try {
      const response = await fetch('http://smsc.biz/httpapi/send', {
        method: 'GET',
        params: {
          username: process.env.SMS_USERNAME,
          password: process.env.SMS_PASSWORD,
          sender_id: 'DHHERB',
          route: 'T',
          phonenumber: mobile,
          message: message
        }
      });
      
      ctx.send({ success: true });
    } catch (error) {
      ctx.throw(500, 'SMS sending failed');
    }
  }
};
```

## Environment Variables

Add to your `.env` file:

```
SMS_USERNAME=sundarppy@gmail.com
SMS_PASSWORD=null
SMS_SENDER_ID=DHHERB
SMS_ROUTE=T
SMS_API_URL=http://smsc.biz/httpapi/send
```

## Frontend Navigation

Update your login page to include OTP login option:

```typescript
// In Login.tsx
<div className="mt-6 text-center">
  <p className="text-gray-600 mb-4">Or login with OTP</p>
  <Link to="/otp-login">
    <Button variant="outline" className="w-full">
      <Phone className="w-4 h-4 mr-2" />
      Login with OTP
    </Button>
  </Link>
</div>
```

## Troubleshooting

### OTP Not Sending
- Check SMS API credentials in environment variables
- Verify phone number format (should be 10 digits for India)
- Check SMS API rate limits

### OTP Verification Failing
- Ensure OTP hasn't expired (5 minutes)
- Check that user exists in database
- Verify OTP matches exactly (case-sensitive)

### User Not Logging In
- Check that `login()` function is called correctly
- Verify user data is being passed correctly
- Check AuthContext implementation

## Future Enhancements

1. **Biometric Login**: Add fingerprint/face recognition after OTP
2. **Remember Device**: Skip OTP on trusted devices
3. **Email OTP**: Alternative to SMS OTP
4. **Backup Codes**: Generate backup codes for account recovery
5. **Login History**: Track login attempts and locations

## Support

For issues or questions, refer to:
- Existing OTP implementation in `ForgotPassword.tsx`
- SMS service in `backend-sms.ts`
- Authentication context in `AuthContext.tsx`
