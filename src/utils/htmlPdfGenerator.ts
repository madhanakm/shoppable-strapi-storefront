import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { formatPrice } from '@/lib/utils';

export const generateOrderReceiptHTML = (order: any): string => {
  if (!order) {
    throw new Error('Order data is required to generate receipt');
  }
  
  const attrs = order.attributes || order;
  
  // Format products, quantities and prices
  const products = attrs.Name ? attrs.Name.split('|') : ['Products'];
  const quantities = attrs.quantity ? String(attrs.quantity).split('|') : ['1'];
  const prices = attrs.prices ? String(attrs.prices).split('|') : [];
  
  // Generate product rows
  let productRows = '';
  products.forEach((product, index) => {
    const qty = quantities[index] || '1';
    
    // Fix price display - ensure it's properly extracted and formatted
    let price = 'N/A';
    if (attrs.prices) {
      // Try to get individual prices first
      if (prices && prices.length > index && prices[index]) {
        const priceValue = prices[index].trim();
        if (priceValue !== '') {
          // Extract just the numeric price value
          const priceMatch = priceValue.match(/(\d+)/);
          if (priceMatch && priceMatch[1]) {
            price = `₹${priceMatch[1]}`;
          } else {
            price = `₹${priceValue}`;
          }
        }
      } else if (attrs.price) {
        // Fallback to single price if available
        const priceMatch = String(attrs.price).match(/(\d+)/);
        if (priceMatch && priceMatch[1]) {
          price = `₹${priceMatch[1]}`;
        } else {
          price = `₹${attrs.price}`;
        }
      }
    } else if (attrs.price) {
      const priceMatch = String(attrs.price).match(/(\d+)/);
      if (priceMatch && priceMatch[1]) {
        price = `₹${priceMatch[1]}`;
      } else {
        price = `₹${attrs.price}`;
      }
    }
    
    productRows += `
      <tr>
        <td>${product.trim()}</td>
        <td style="text-align: center;">${qty.trim()}</td>
        <td style="text-align: right;">${price}</td>
      </tr>
    `;
  });
  
  // Fill in empty rows if needed for template consistency
  while (productRows.split('<tr>').length <= 5) {
    productRows += `
      <tr>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    `;
  }
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Order Receipt - Dharani Herbbals</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          padding: 20px;
          color: #333;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #ddd;
          padding-bottom: 10px;
        }

        .header h1 {
          color: #2e7d32;
          margin: 0;
        }

        .header .title {
          color: #2e7d32;
          font-weight: bold;
        }

        .section {
          margin-top: 30px;
        }

        .section h3 {
          margin-bottom: 10px;
          color: #444;
        }

        .section .info-grid {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          font-size: 14px;
        }

        .info-grid div {
          width: 48%;
        }

        .order-items {
          margin-top: 20px;
          width: 95%;
          border-collapse: collapse;
          margin-left: auto;
          margin-right: auto;
        }

        .order-items th,
        .order-items td {
          border: 1px solid #ccc;
          padding: 15px;
          text-align: left;
          font-size: 14px;
        }

        .order-items th {
          background: #f5f5f5;
        }

        .total {
          text-align: right;
          padding-top: 10px;
          font-weight: bold;
          font-size: 16px;
        }

        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 13px;
          color: #777;
        }
      </style>
    </head>
    <body>

      <div class="header">
        <h1>Dharani Herbbals</h1>
        <div class="title">ORDER RECEIPT</div>
      </div>

      <div class="section">
        <h3>ORDER INFORMATION</h3>
        <div class="info-grid">
          <div>
            <p><strong>Order Number:</strong> ${attrs.ordernum || order.id || 'N/A'}</p>
            <p><strong>Invoice Number:</strong> ${attrs.invoicenum || 'N/A'}</p>
            <p><strong>Order Date:</strong> ${new Date(attrs.createdAt || new Date()).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${attrs.payment || 'COD'}</p>
          </div>
          <div>
            <p><strong>Customer Name:</strong> ${attrs.customername || 'N/A'}</p>
            <p><strong>Phone:</strong> ${attrs.phoneNum || 'N/A'}</p>
            <p><strong>Email:</strong> ${attrs.email || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>SHIPPING & BILLING ADDRESS</h3>
        <div class="info-grid">
          <div>
            <p><strong>Shipping Address:</strong><br/>
              ${attrs.shippingAddress || 'N/A'}
            </p>
          </div>
          <div>
            <p><strong>Billing Address:</strong><br/>
              ${attrs.billingAddress || attrs.shippingAddress || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>ORDER ITEMS</h3>
        <table class="order-items">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
        <div class="total">Total Amount: ₹${attrs.totalValue || attrs.total || 0}</div>
      </div>

      <div class="footer">
        <p>Thank you for shopping with Dharani Herbbals!</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>

    </body>
    </html>
  `;
  
  return html;
};

export const generateOrderReceipt = async (order: any) => {
  try {
    const html = generateOrderReceiptHTML(order);
    
    // Create a temporary container to render the HTML that's hidden from view
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '800px'; // Fixed width to prevent layout shifts
    document.body.appendChild(container);
    
    // Use html2canvas to convert the HTML to an image with optimized settings
    const canvas = await html2canvas(container, {
      scale: 1.5, // Balance between quality and file size
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff' // Ensure white background
    });
    
    // Remove the temporary container
    document.body.removeChild(container);
    
    // Create a new PDF document with compression
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true // Enable compression to reduce file size
    });
    
    // Add the image to the PDF with compression
    const imgData = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG with 90% quality for better quality
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20; // Add margin
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'JPEG', 10, 10, pdfWidth, pdfHeight); // Add 10mm padding on all sides
    
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Fallback method if html2canvas doesn't work in the environment
export const downloadOrderReceiptHTML = (order: any) => {
  const html = generateOrderReceiptHTML(order);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `Order-${(order.attributes || order).ordernum || order.id}-Receipt.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};