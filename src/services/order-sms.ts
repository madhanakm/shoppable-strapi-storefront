export const sendOrderConfirmationSMS = async (phoneNumber: string, orderNumber: string, totalAmount: number): Promise<boolean> => {
  try {
    // Clean phone number - remove any spaces, dashes, or country code
    let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      cleanPhone = cleanPhone.substring(2);
    }
    if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
    }
    
    
    
    const message = `Thank you for your order. ID: ${orderNumber}, Amt: Rs.${totalAmount}. Will notify once shipped. Thanks for shopping - Dharani Herbbals.`;
    
    const url = `http://smsc.biz/httpapi/send?username=sundarppy@gmail.com&password=Dharani123&sender_id=DHHERB&route=T&phonenumber=${cleanPhone}&message=${encodeURIComponent(message)}`;
    
    
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const result = await response.text();
    
    
    if (response.ok && !result.includes('error')) {
      
      return true;
    } else {
      
      return false;
    }
  } catch (error) {
    
    return false;
  }
};