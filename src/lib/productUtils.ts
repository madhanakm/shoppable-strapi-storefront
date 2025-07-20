/**
 * Utility functions for product display
 */

/**
 * Filters out price information from product names
 * This removes any price patterns like "₹100", "Rs.100", "100/-" etc. from product names
 * 
 * @param name The product name that might contain price
 * @returns The product name without price information
 */
export const filterPriceFromName = (name: string): string => {
  if (!name) return '';
  
  // Remove price patterns like "₹100", "Rs.100", "100/-", "Rs 100", etc.
  return name
    .replace(/(\s*[-–—]\s*)?(\₹|Rs\.?|INR)\s*\d+(\.\d+)?(\s*\/-)?/gi, '')
    .replace(/\d+(\.\d+)?\s*(\/-|Rs\.?|₹|INR)/gi, '')
    .replace(/\(\s*(\₹|Rs\.?|INR)\s*\d+(\.\d+)?(\s*\/-)?(\s*\))/gi, '')
    .replace(/\s{2,}/g, ' ') // Remove extra spaces
    .trim();
};