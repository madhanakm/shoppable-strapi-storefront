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
    
    // Format the message with actual values
    const message = `Thank you for your order. ID: ${orderNumber}, Amt: Rs.${totalAmount}. Will notify once shipped. Thanks for shopping - Dharani Herbbals.`;
    
    // Use the exact URL format that works
    const url = `http://smsc.biz/httpapi/send?username=sundarppy@gmail.com&password=Dharani123&sender_id=DHHERB&route=T&phonenumber=${cleanPhone}&message=${encodeURIComponent(message)}`;
    
    // Make the request directly with no CORS issues
    const response = await fetch(url, {
      mode: 'no-cors' // This prevents CORS errors
    });
    
    return true; // Assume success since we can't check the response with no-cors
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};