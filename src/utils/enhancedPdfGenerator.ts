import { jsPDF } from 'jspdf';
import { formatPrice } from '@/lib/utils';

// Import logo
import { base64Logo } from './logoBase64';

export const generateOrderReceipt = (order: any) => {
  if (!order) {
    throw new Error('Order data is required to generate receipt');
  }
  
  const attrs = order.attributes || order;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true // Enable compression to reduce file size
  });
  
  // Set document properties
  doc.setProperties({
    title: `Order Receipt #${attrs.ordernum || order.id || 'N/A'}`,
    subject: 'Order Receipt',
    author: 'Dharani Herbbals',
    keywords: 'receipt, order, invoice',
    creator: 'Dharani Herbbals'
  });
  
  // Define colors
  const primaryColor = [0, 100, 0]; // Dark green
  const secondaryColor = [0, 128, 0]; // Green
  const textColor = [60, 60, 60]; // Dark gray
  const lightGray = [200, 200, 200]; // Light gray for lines
  
  // Define margins and positions - increased for whole document
  const margin = 30;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const tablePadding = 5; // Added padding for tables
  
  // Add header with logo and company name
  doc.setFillColor(250, 250, 250);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add logo
  try {
    doc.addImage(base64Logo, 'PNG', margin, 10, 30, 20);
  } catch (error) {
    console.error('Error adding logo:', error);
  }
  
  // Add company name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Dharani Herbbals', margin, 20);
  
  // Add receipt title
  doc.setFontSize(14);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('ORDER RECEIPT', pageWidth - margin, 20, { align: 'right' });
  
  // Add horizontal line
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, 40, pageWidth - margin, 40);
  
  // Order information section
  doc.setFontSize(11);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('ORDER INFORMATION', margin, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Order Number: ${attrs.ordernum || order.id || 'N/A'}`, margin, 62);
  doc.text(`Invoice Number: ${attrs.invoicenum || 'N/A'}`, margin, 68);
  doc.text(`Order Date: ${new Date(attrs.createdAt || new Date()).toLocaleDateString()}`, margin, 74);
  doc.text(`Payment Method: ${attrs.payment || 'COD'}`, margin, 80);
  
  // Status with colored box
  // Status section removed
  
  // Reset text color
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  
  // Customer information section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CUSTOMER INFORMATION', margin, 95);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${attrs.customername || 'N/A'}`, margin, 102);
  doc.text(`Phone: ${attrs.phoneNum || 'N/A'}`, margin, 108);
  doc.text(`Email: ${attrs.email || 'N/A'}`, margin, 114);
  
  // Shipping address section
  if (attrs.shippingAddress) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SHIPPING ADDRESS', pageWidth / 2, 95);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Split address into multiple lines if needed
    const addressLines = doc.splitTextToSize(attrs.shippingAddress, (pageWidth / 2) - margin - 5);
    for (let i = 0; i < addressLines.length; i++) {
      doc.text(addressLines[i], pageWidth / 2, 102 + (i * 6));
    }
  }
  
  // Billing address section
  if (attrs.billingAddress) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('BILLING ADDRESS', pageWidth / 2, 130);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Split address into multiple lines if needed
    const billingLines = doc.splitTextToSize(attrs.billingAddress, (pageWidth / 2) - margin - 5);
    for (let i = 0; i < billingLines.length; i++) {
      doc.text(billingLines[i], pageWidth / 2, 137 + (i * 6));
    }
  }
  
  // Add horizontal line
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.line(margin, 125, pageWidth - margin, 125);
  
  // Order items section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ORDER ITEMS', margin, 135);
  
  // Table header with padding
  doc.setFillColor(245, 245, 245);
  doc.rect(margin + tablePadding, 140, pageWidth - (margin * 2) - (tablePadding * 2), 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Item', margin + tablePadding + 5, 146);
  doc.text('Quantity', pageWidth - margin - 70, 146);
  doc.text('Price', pageWidth - margin - 35, 146);
  
  // Table content - display each product as individual line
  doc.setFont('helvetica', 'normal');
  
  let yPos = 156;
  const products = attrs.Name ? attrs.Name.split('|') : ['Products'];
  const quantities = attrs.quantity ? String(attrs.quantity).split('|') : ['1'];
  const prices = attrs.prices ? String(attrs.prices).split('|') : [];
  
  // Draw table header lines with padding
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.line(margin + tablePadding, 150, pageWidth - margin - tablePadding, 150);
  
  // Table headers
  doc.setFont('helvetica', 'bold');
  doc.text('Product', margin + tablePadding + 5, 146);
  doc.text('Qty', pageWidth - margin - 70, 146);
  doc.text('Price', pageWidth - margin - 35, 146);
  
  doc.setFont('helvetica', 'normal');
  products.forEach((product, index) => {
    const qty = quantities[index] || '1';
    
    // Fix price display - ensure it's properly extracted and formatted
    let price = 'N/A';
    if (attrs.prices) {
      // Try to get individual prices first
      if (prices && prices.length > index && prices[index]) {
        price = formatPrice(prices[index].trim());
      } else if (attrs.price) {
        // Fallback to single price if available
        price = formatPrice(attrs.price);
      }
    } else if (attrs.price) {
      price = formatPrice(attrs.price);
    }
    
    // Add padding to table content
    doc.text(product.trim(), margin + tablePadding + 5, yPos);
    doc.text(qty.trim(), pageWidth - margin - 70, yPos);
    doc.text(price, pageWidth - margin - 35, yPos, { align: 'right' });
    yPos += 10;
    
    // Draw line after each product with padding
    doc.setDrawColor(245, 245, 245);
    doc.line(margin + tablePadding, yPos - 5, pageWidth - margin - tablePadding, yPos - 5);
  });
  
  // Adjust the position of the horizontal line based on the number of products
  const lineYPos = Math.max(165, yPos + 5);
  
  // Add horizontal line with padding
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.line(margin + tablePadding, lineYPos, pageWidth - margin - tablePadding, lineYPos);
  
  // Order summary
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', pageWidth - margin - 70, 175);
  doc.setFontSize(12);
  doc.text(formatPrice(attrs.totalValue || attrs.total || 0), pageWidth - margin - 35, 175);
  
  // Add notes if available
  if (attrs.remarks) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('NOTES:', margin, 190);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const noteLines = doc.splitTextToSize(attrs.remarks, pageWidth - (margin * 2));
    for (let i = 0; i < noteLines.length; i++) {
      doc.text(noteLines[i], margin, 197 + (i * 6));
    }
  }
  
  // Footer
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Thank you for shopping with Dharani Herbbals!', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
  
  return doc;
};