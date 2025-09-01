/**
 * Service to fetch ecommerce settings from the API
 */

export interface EcommerceSettings {
  cod: boolean;
  onlinePay: boolean;
  tamilNaduShipping: string;
  otherStateShipping: string;
  tamilNaduFreeShipping: string;
  otherStateFreeShipping: string;
}

/**
 * Fetches ecommerce settings from the API
 * @returns Promise with ecommerce settings
 */
export const getEcommerceSettings = async (): Promise<EcommerceSettings> => {
  try {
    const response = await fetch('https://api.dharaniherbbals.com/api/ecommerce-settings/');
    const data = await response.json();
    
    // Handle the array format returned by the API
    let settings = {};
    
    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      // API returns an array of settings, use the first one
      settings = data.data[0].attributes || {};
    } else if (data && data.data && data.data.attributes) {
      // Standard Strapi v4 format (single object)
      settings = data.data.attributes;
    } else if (data && data.attributes) {
      // Alternative format
      settings = data.attributes;
    } else if (data) {
      // Direct format
      settings = data;
    }
    
    // Convert to boolean values and include shipping prices
    const result = {
      cod: settings.cod === true,
      onlinePay: settings.onlinePay === true,
      tamilNaduShipping: settings.tamilNaduShipping || '50',
      otherStateShipping: settings.otherStateShipping || '150',
      tamilNaduFreeShipping: settings.tamilNaduFreeShipping || '750',
      otherStateFreeShipping: settings.otherStateFreeShipping || '1000'
    };
    return result;
  } catch (error) {
    // Error handling
    // Default values if API fails
    return {
      cod: true,
      onlinePay: true,
      tamilNaduShipping: '50',
      otherStateShipping: '150',
      tamilNaduFreeShipping: '750',
      otherStateFreeShipping: '1000'
    };
  }
};