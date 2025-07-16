export const getPriceByUserType = (product: any, userType?: string) => {
  if (!product) return 0;
  
  const type = userType?.toLowerCase() || 'customer';
  
  switch (type) {
    case 'reseller':
      return parseFloat(product.resellerprice || product.customerprice || 0);
    case 'retailer':
      return parseFloat(product.retailprice || product.customerprice || 0);
    case 'distributor':
      return parseFloat(product.distributiorprice || product.customerprice || 0);
    case 'sarvo':
      return parseFloat(product.sarvoprice || product.customerprice || 0);
    case 'drug':
      return parseFloat(product.drug || product.customerprice || 0);
    case 'customer':
    default:
      return parseFloat(product.customerprice || 0);
  }
};

export const getVariablePriceRange = (variations: any[], userType?: string) => {
  const prices = variations.map(v => getPriceByUserType(v, userType)).filter(p => p > 0);
  if (prices.length === 0) return null;
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  return { minPrice, maxPrice, prices };
};