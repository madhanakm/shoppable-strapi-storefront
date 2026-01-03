import { jsPDF } from 'jspdf';
import { formatPrice } from '@/lib/utils';

// Simplified version without autotable to fix white screen issue

export const generateOrderReceipt = (order: any) => {
  if (!order) {
    throw new Error('Order data is required to generate receipt');
  }
  const attrs = order.attributes || order;
  const doc = new jsPDF();
  
  // Add simple header
  doc.setFontSize(18);
  doc.setTextColor(0, 100, 0);
  doc.text('Dharani Herbbals', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
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
  
  // Add column headers
  doc.setFont('helvetica', 'bold');
  doc.text('Product', 14, 142);
  doc.text('Qty', 120, 142);
  doc.text('Price', 150, 142);
  doc.setFont('helvetica', 'normal');
  
  // Display each product as individual line
  let yPos = 149;
  const products = attrs.Name ? attrs.Name.split('|') : ['Products'];
  const quantities = attrs.quantity ? String(attrs.quantity).split('|') : ['1'];
  const prices = attrs.prices ? String(attrs.prices).split('|') : [];
  
  products.forEach((product, index) => {
    const qty = quantities[index] || '1';
    let price = 'N/A';
    if (prices && prices.length > index) {
      const priceValue = prices[index];
      if (priceValue && priceValue.trim() !== '') {
        // Extract just the numeric price value
        const priceMatch = priceValue.match(/(\d+)/);
        if (priceMatch && priceMatch[1]) {
          price = `₹${priceMatch[1]}`;
        } else {
          price = `₹${priceValue.trim()}`;
        }
      }
    }
    
    // Display product, quantity and price in separate columns
    doc.text(product.trim(), 14, yPos);
    doc.text(qty.trim(), 120, yPos);
    doc.text(price, 150, yPos);
    yPos += 7;
  });
  
  // Display total amount
  const total = attrs.totalValue || attrs.total || 0;
  doc.text(`Total Amount: ₹${total}`, 14, yPos + 7);
  
  // Billing address if available
  if (attrs.billingAddress) {
    doc.setFontSize(11);
    doc.text('Billing Address', 14, yPos + 20);
    doc.setFontSize(10);
    doc.text(attrs.billingAddress, 14, yPos + 27);
  }
  
  // Footer
  doc.setFontSize(10);
  doc.text('Thank you for shopping with Dharani Herbbals!', 105, 270, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 277, { align: 'center' });
  
  return doc;
};