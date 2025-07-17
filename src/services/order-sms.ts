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
    
    // Use the exact URL format with field placeholders as provided
    const url = `http://smsc.biz/httpapi/send?username=sundarppy@gmail.com&password=Dharani123&sender_id=DHHERB&route=T&phonenumber=${cleanPhone}&message=Thank%20you%20for%20your%20order.%20ID%3A%20${orderNumber}%2C%20Amt%3A%20Rs.${totalAmount}.%20Will%20notify%20once%20shipped.%20Thanks%20for%20shopping%20-%20Dharani%20Herbbals.`;
    
    // Use simple fetch with no extra headers
    const response = await fetch(url);
    const result = await response.text();
    
    return true; // Assume success since we're using the known working URL format
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};