import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Create a safer PDF utility that doesn't rely on html2canvas
export const createPDF = async (options: {
  title: string;
  filename: string;
  content: Array<{
    text?: string;
    headers?: string[];
    data?: any[][];
    margin?: number;
  }>;
}) => {
  try {
    const { title, filename, content } = options;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 22);
    doc.setFontSize(12);
    
    let yPosition = 30;
    
    // Add content
    content.forEach((item) => {
      const margin = item.margin || 14;
      
      // Add text content
      if (item.text) {
        const splitText = doc.splitTextToSize(item.text, 180);
        doc.text(splitText, margin, yPosition);
        yPosition += 10 * (splitText.length || 1);
      }
      
      // Add table content
      if (item.headers && item.data) {
        (doc as any).autoTable({
          startY: yPosition,
          head: [item.headers],
          body: item.data,
          margin: { left: margin, right: margin },
          styles: { cellPadding: 5 },
          headStyles: { fillColor: [245, 245, 245], textColor: [50, 50, 50] },
          columnStyles: { 2: { halign: 'right' } }, // Right-align the third column (usually price)
        });
        
        // Update position after table
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
      
      yPosition += 10;
    });
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error creating PDF:', error);
    return false;
  }
};

// Simple text-only PDF generator that doesn't use html2canvas
export const generateSimplePDF = (text: string, filename: string = 'document') => {
  try {
    const doc = new jsPDF();
    
    // Add content
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 14, 22);
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating simple PDF:', error);
    return false;
  }
};