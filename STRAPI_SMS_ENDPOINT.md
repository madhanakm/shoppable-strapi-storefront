# Strapi SMS Endpoint Setup

Create this custom API endpoint in your Strapi backend to handle SMS sending:

## 1. Create Custom Route

Create file: `src/api/send-sms/routes/send-sms.js`

```javascript
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/send-sms',
      handler: 'send-sms.sendSMS',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
```

## 2. Create Controller

Create file: `src/api/send-sms/controllers/send-sms.js`

```javascript
'use strict';

const fetch = require('node-fetch');

module.exports = {
  async sendSMS(ctx) {
    try {
      const { mobile, otp } = ctx.request.body;
      
      if (!mobile || !otp) {
        return ctx.badRequest('Mobile number and OTP are required');
      }

      const smsConfig = {
        username: 'sundarppy@gmail.com',
        password: 'Dharani123',
        sender_id: 'DHHERB',
        route: 'T',
        base_url: 'http://smsc.biz/httpapi/send'
      };

      const message = `OTP for Login/Transaction on Dharani Herbbals is ${otp} and valid for 30 minutes. Do not share this OTP with anyone for security reasons.`;
      
      const params = new URLSearchParams({
        username: smsConfig.username,
        password: smsConfig.password,
        sender_id: smsConfig.sender_id,
        route: smsConfig.route,
        phonenumber: mobile,
        message: message
      });

      const response = await fetch(`${smsConfig.base_url}?${params.toString()}`);
      const result = await response.text();
      
      console.log('SMS API Response:', result);

      if (response.ok) {
        ctx.send({
          success: true,
          message: 'SMS sent successfully',
          data: result
        });
      } else {
        ctx.badRequest('Failed to send SMS');
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      ctx.internalServerError('SMS sending failed');
    }
  },
};
```

## 3. Install node-fetch in Strapi

Run in your Strapi backend directory:
```bash
npm install node-fetch@2
```

## 4. Restart Strapi

After creating these files, restart your Strapi server.

The endpoint will be available at: `https://api.dharaniherbbals.com/api/send-sms`