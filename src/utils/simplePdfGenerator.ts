import { jsPDF } from 'jspdf';
import { formatPrice } from '@/lib/utils';

export const generateOrderReceipt = (order: any) => {
  try {
    const attrs = order.attributes || order;
    const doc = new jsPDF();
    
    // Add simple header
    doc.setFontSize(18);
    doc.text('Dharani Herbbals', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Order Receipt', 105, 30, { align: 'center' });
    
    // Order details
    doc.setFontSize(10);
    doc.text(`Order #: ${attrs.ordernum || order.id || 'N/A'}`, 14, 45);
    doc.text(`Date: ${new Date(attrs.createdAt || new Date()).toLocaleDateString()}`, 14, 52);
    doc.text(`Payment Method: ${attrs.payment || 'COD'}`, 14, 59);
    
    // Customer details
    doc.setFontSize(11);
    doc.text('Customer Details', 14, 80);
    doc.setFontSize(10);
    doc.text(`Name: ${attrs.customername || 'N/A'}`, 14, 87);
    doc.text(`Phone: ${attrs.phoneNum || 'N/A'}`, 14, 94);
    
    // Shipping address
    if (attrs.shippingAddress) {
      doc.setFontSize(11);
      doc.text('Shipping Address', 14, 108);
      doc.setFontSize(10);
      doc.text(attrs.shippingAddress, 14, 115);
    }
    
    // Order items
    doc.setFontSize(11);
    doc.text('Order Items', 14, 135);
    doc.setFontSize(10);
    
    // Display each product as individual line
    let yPos = 142;
    const products = attrs.Name ? attrs.Name.split('|') : ['Products'];
    const quantities = attrs.quantity ? String(attrs.quantity).split('|') : ['1'];
    const prices = attrs.prices ? String(attrs.prices).split('|') : [];
    
    products.forEach((product, index) => {
      const qty = quantities[index] || '1';
      const price = prices[index] ? formatPrice(prices[index].trim()) : 'N/A';
      doc.text(`${product.trim()} - Qty: ${qty.trim()} - Price: ${price}`, 14, yPos);
      yPos += 7;
    });
    
    doc.text(`Total Amount: ${formatPrice(attrs.totalValue || attrs.total || 0)}`, 14, yPos + 7);
    
    // Billing address if available
    if (attrs.billingAddress) {
      doc.setFontSize(11);
      doc.text('Billing Address', 14, yPos + 20);
      doc.setFontSize(10);
      doc.text(attrs.billingAddress, 14, yPos + 27);
    }
    
    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for shopping with Dharani Herbbals!', 105, 280, { align: 'center' });
    
    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};