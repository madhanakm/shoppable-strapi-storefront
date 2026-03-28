# Strapi ecom-users Field Configuration

## How to Add Fields in Strapi Admin

### Access Content Type Editor
1. Go to Strapi Admin Panel
2. Click **Content Types** in left sidebar
3. Click **ecom-users**
4. Click **Edit** button

### Add Field 1: loginOtp

1. Click **+ Add another field**
2. Select **Text** field type
3. Configure:
   - **Name**: `loginOtp`
   - **Display name**: `Login OTP`
   - **Description**: `6-digit OTP for login verification`
   - **Required field**: No
   - **Searchable**: Yes
   - **Sortable**: No
4. Click **Finish**

### Add Field 2: loginOtpExpiresAt

1. Click **+ Add another field**
2. Select **DateTime** field type
3. Configure:
   - **Name**: `loginOtpExpiresAt`
   - **Display name**: `Login OTP Expires At`
   - **Description**: `Timestamp when login OTP expires`
   - **Required field**: No
   - **Searchable**: No
   - **Sortable**: Yes
4. Click **Finish**

### Add Field 3: loginOtpAttempts

1. Click **+ Add another field**
2. Select **Number** field type
3. Configure:
   - **Name**: `loginOtpAttempts`
   - **Display name**: `Login OTP Attempts`
   - **Description**: `Number of failed OTP verification attempts`
   - **Required field**: No
   - **Searchable**: No
   - **Sortable**: Yes
   - **Default value**: `0`
   - **Min value**: `0`
   - **Max value**: `5`
4. Click **Finish**

### Save Changes

1. Click **Save** button at top right
2. Wait for confirmation message
3. Fields are now added! ✅

## Field Summary

| Field Name | Type | Required | Default | Min | Max | Notes |
|-----------|------|----------|---------|-----|-----|-------|
| loginOtp | Text | No | - | - | - | Stores 6-digit OTP |
| loginOtpExpiresAt | DateTime | No | - | - | - | OTP expiry timestamp |
| loginOtpAttempts | Number | No | 0 | 0 | 5 | Failed attempt counter |

## Existing Fields (Already Present)

These fields should already exist in ecom-users:

| Field Name | Type | Purpose |
|-----------|------|---------|
| otp | Text | Password reset OTP |
| otpExpiresAt | DateTime | Password reset OTP expiry |
| isVerified | Boolean | User verification status |

## Complete ecom-users Field List

After adding the 3 new fields, your ecom-users should have:

```
✅ name (Text)
✅ email (Email)
✅ phone (Text)
✅ password (Password)
✅ userType (Enumeration)
✅ creditPayment (Boolean)
✅ creditLimit (Text)
✅ otp (Text) - Password reset
✅ otpExpiresAt (DateTime) - Password reset
✅ isVerified (Boolean)
✅ loginOtp (Text) - NEW
✅ loginOtpExpiresAt (DateTime) - NEW
✅ loginOtpAttempts (Number) - NEW
```

## Verification Checklist

After adding fields, verify:

- [ ] All 3 new fields appear in ecom-users
- [ ] loginOtp is Text type
- [ ] loginOtpExpiresAt is DateTime type
- [ ] loginOtpAttempts is Number type with default 0
- [ ] Fields are searchable/sortable as configured
- [ ] Save was successful (no error messages)

## API Endpoint

After adding fields, the API endpoint will accept:

```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9942492001",
    "password": "secure_password",
    "loginOtp": "123456",
    "loginOtpExpiresAt": "2024-01-15T10:30:00Z",
    "loginOtpAttempts": 0,
    "isVerified": true
  }
}
```

## Troubleshooting

### Fields not showing after save
- Refresh the page
- Clear browser cache
- Restart Strapi server

### Can't add fields
- Check user has admin permissions
- Check content type is not locked
- Try in incognito mode

### API still not accepting fields
- Restart Strapi server
- Clear Strapi cache
- Check field names match exactly (case-sensitive)

## Next Steps

1. ✅ Add 3 fields to ecom-users
2. ⏳ Update SMS controller to handle type parameter
3. ⏳ Test OTP login flow
4. ⏳ Deploy to production

---

**Time to Complete**: ~5 minutes
**Difficulty**: Easy
**Status**: Ready to implement
