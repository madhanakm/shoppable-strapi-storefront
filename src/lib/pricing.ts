export const getPriceByUserType = (product: any, userType?: string) => {
  if (!userType) {
    return parseFloat(product.mrp || product.price || product.customerprice) || 0;
  }

  // Convert to lowercase for case-insensitive comparison
  const type = userType.toLowerCase();
  
  switch (type) {
    case 'reseller':
      return parseFloat(product.resellerprice || product.mrp || product.price) || 0;
    case 'retail':
    case 'retailer':
      return parseFloat(product.retailprice || product.mrp || product.price) || 0;
    case 'distributor':
      return parseFloat(product.distributorprice || product.mrp || product.price) || 0;
    case 'sarvo':
      return parseFloat(product.sarvoprice || product.mrp || product.price) || 0;
    case 'customer':
    default:
      return parseFloat(product.customerprice || product.mrp || product.price) || 0;
  }
};

export const getVariablePriceRange = (variations: any[], userType?: string) => {
  const prices = variations.map(v => getPriceByUserType(v, userType)).filter(p => p > 0);
  if (prices.length === 0) return null;
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  return { minPrice, maxPrice, prices };
};