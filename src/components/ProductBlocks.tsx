import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart, TrendingUp, Flame, Zap, Tag, ArrowRight, Eye } from 'lucide-react';
import StarRating from './StarRating';
import { useWishlistContext } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useQuickCheckout } from '@/hooks/useQuickCheckout';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useTranslation, LANGUAGES } from './TranslationProvider';
import { getBulkProductReviewStats } from '@/services/reviews';
import { useAuth } from '@/contexts/AuthContext';
import { getPriceByUserType, getVariablePriceRange } from '@/lib/pricing';
import { filterPriceFromName } from '@/lib/productUtils';
import { useUserType } from '@/hooks/useUserTypeQuery';
import { useBuyNow } from '@/hooks/useBuyNow';

const API_URL = 'https://api.dharaniherbbals.com/api';
const API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;
const PRODUCT_FIELDS = 'fields[0]=Name&fields[1]=skuid&fields[2]=mrp&fields[3]=resellerprice&fields[4]=customerprice&fields[5]=retailprice&fields[6]=sarvoprice&fields[7]=distributorprice&fields[8]=price&fields[9]=type&fields[10]=status&fields[11]=tamil&fields[12]=isVariableProduct&fields[13]=variations&fields[14]=category&fields[15]=newLaunch';

const fetchProductPhoto = async (productId: number): Promise<string> => {
  const response = await fetch(`${API_URL}/product-masters/${productId}?fields[0]=photo`, {
    headers: { 'Authorization': `Bearer ${API_TOKEN}` }
  });
  if (!response.ok) return '';
  const data = await response.json();
  return data.data?.attributes?.photo || '';
};

const formatProductList = (productList: any[], userType: string) =>
  productList.map(item => {
    const attributes = item.attributes || item;
    let price = getPriceByUserType(attributes, userType);
    let priceRange = null;
    if (attributes.isVariableProduct && attributes.variations) {
      try {
        const variations = typeof attributes.variations === 'string' ? JSON.parse(attributes.variations) : attributes.variations;
        const prices = variations.map((v: any) => getPriceByUserType(v, userType));
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          price = minPrice;
          priceRange = minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
        }
      } catch (e) {}
    }
    return {
      id: item.id || Math.random().toString(),
      name: attributes.Name || attributes.name || 'Product',
      tamil: attributes.tamil || null,
      price,
      priceRange,
      image: '',
      originalPrice: attributes.originalPrice || null,
      category: attributes.category,
      skuid: attributes.skuid || attributes.SKUID,
      isVariableProduct: attributes.isVariableProduct,
      variations: attributes.variations,
      userType
    };
  });

const fetchProductsWithPhotos = async (url: string, userType: string) => {
  const response = await fetch(`${url}&${PRODUCT_FIELDS}`, {
    headers: { 'Authorization': `Bearer ${API_TOKEN}` }
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const formatted = formatProductList(data.data || [], userType);
  const productIds = formatted.map((p: any) => parseInt(p.id)).filter((id: number) => !isNaN(id));
  const [reviewStats, ...photos] = await Promise.all([
    productIds.length > 0 ? getBulkProductReviewStats(productIds).catch(() => ({})) : Promise.resolve({}),
    ...formatted.map((p: any) => fetchProductPhoto(p.id))
  ]);
  formatted.forEach((p: any, i: number) => { p.image = photos[i] || ''; });
  return { products: formatted, reviewStats };
};

// Product Card Component
const ProductCard = ({ product, reviewStats = {} }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();
  const { addToCart } = useCart();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const { buyNow } = useBuyNow();
  const navigate = useNavigate();
  const { language, translate } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  const handleWishlistToggle = () => {
    const productId = product.id.toString();
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const handleAddToCart = () => {
    // For variable products, use the first variation
    if (product.isVariableProduct && product.variations) {
      try {
        const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
        if (variations && variations.length > 0) {
          const firstVariation = variations[0];
          const skuid = firstVariation.skuid || `${product.id}-${firstVariation.value || firstVariation.attributeValue}`;
          const variationPrice = getPriceByUserType(firstVariation, product.userType || 'customer');
          addToCart(skuid, product.id.toString(), 1, product.name, variationPrice);
          return;
        }
      } catch (e) {
        console.error('Error parsing variations:', e);
      }
    }
    
    // For regular products
    const skuid = product.skuid || product.id.toString();
    addToCart(skuid, product.id.toString(), 1, product.name, product.price);
  };
  
  const handleBuyNow = () => {
    // For variable products, use the first variation
    if (product.isVariableProduct && product.variations) {
      try {
        const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
        if (variations && variations.length > 0) {
          const firstVariation = variations[0];
          const skuid = firstVariation.skuid || `${product.id}-${firstVariation.value || firstVariation.attributeValue}`;
          const variationName = firstVariation.value || firstVariation.attributeValue || Object.values(firstVariation)[0];
          
          buyNow({
            id: product.id.toString(),
            skuid: skuid,
            name: `${product.name} - ${variationName}`,
            tamil: product.tamil ? `${product.tamil} - ${variationName}` : null,
            price: getPriceByUserType(firstVariation, product.userType || 'customer'),
            image: product.image,
            category: product.category,
            variation: variationName,
            quantity: 1
          });
          return;
        }
      } catch (e) {
        console.error('Error parsing variations:', e);
      }
    }
    
    // For regular products
    const skuid = product.skuid || product.id.toString();
    buyNow({
      id: product.id.toString(),
      skuid: skuid,
      name: product.name,
      tamil: product.tamil || null,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1
    });
  };



  const getBadgeColor = (badge) => {
    switch (badge?.toLowerCase()) {
      case 'deals': return 'bg-gradient-to-r from-purple-500 to-purple-600';
      case 'trending': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'hot': return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'popular': return 'bg-gradient-to-r from-green-500 to-green-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getDiscountPercentage = () => {
    if (product.originalPrice && product.price) {
      const discount = ((product.originalPrice - product.price) / product.originalPrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/20 bg-white rounded-3xl hover:-translate-y-3 hover:rotate-1">
      <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Link to={`/product/${product.id}`} className="block cursor-pointer">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-56 object-cover group-hover:scale-105 transition-all duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x300?text=Product';
            }}
          />
        </Link>
        
        {/* Discount Badge */}
        {getDiscountPercentage() > 0 && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 text-xs font-bold rounded-2xl shadow-lg animate-pulse">
            <span className="text-lg">🔥</span> -{getDiscountPercentage()}%
          </div>
        )}
        
        {/* Type Badge */}
        {product.badge && (
          <div className={`absolute top-4 right-4 px-4 py-2 text-xs font-bold rounded-2xl ${getBadgeColor(product.badge)} text-white shadow-xl backdrop-blur-sm`}>
            {product.badge === 'deals' && '💰'}
            {product.badge === 'trending' && '📈'}
            {product.badge === 'hot' && '🔥'}
            {product.badge === 'popular' && '⭐'}
            <span className="ml-1">{product.badge.charAt(0).toUpperCase() + product.badge.slice(1)}</span>
          </div>
        )}
        
        {/* Wishlist Button */}
        <Button 
          size="sm" 
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full shadow-xl bg-white/95 hover:bg-white border-2 border-gray-100 hover:border-red-200 hover:scale-110"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleWishlistToggle();
          }}
        >
          <Heart className={`w-4 h-4 transition-colors ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'} `} />
        </Button>
      </div>
      
      <CardContent className="p-6 bg-white">
        <Link to={`/product/${product.id}`}>
          <h3 className={`font-bold text-base mb-3 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem] leading-tight uppercase ${isTamil ? 'tamil-text' : ''}`}>
            {isTamil && product.tamil ? filterPriceFromName(product.tamil) : filterPriceFromName(product.name)}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mb-4">
          <StarRating 
            rating={reviewStats[product.id]?.average || 0} 
            count={reviewStats[product.id]?.count || 0} 
            size="sm" 
            showCount={true} 
          />
        </div>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-primary">
              {product.priceRange || formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through font-medium">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {getDiscountPercentage() > 0 && (
            <span className="text-xs text-green-600 font-semibold">Save {getDiscountPercentage()}%</span>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl py-1.5 text-xs font-medium" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
              }}
              style={{background: 'linear-gradient(to right, #e6e6e6, #f2f2f2)', color: '#333'}}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              <span className={`${isTamil ? 'tamil-text text-[9px]' : 'text-xs'}`}>{translate('products.addToCart')}</span>
            </Button>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl py-1.5 text-xs font-medium" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBuyNow();
            }}
            style={{background: 'linear-gradient(to right, #009108, #55bf57)'}}
          >
            <span className={`${isTamil ? 'tamil-text text-[9px]' : 'text-xs'}`}>{translate('product.buyNow')}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Product Block Component
const ProductBlock = ({ type, title, description, icon, bgColor, accentColor }) => {
  const [products, setProducts] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const { data: userType = 'customer' } = useUserType();
  const { language, translate } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const { buyNow } = useBuyNow();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { products: p, reviewStats: r } = await fetchProductsWithPhotos(
          `${API_URL}/product-masters?filters[type][$eq]=${type}&filters[status][$eq]=true&pagination[pageSize]=20`,
          userType
        );
        setProducts(p);
        setReviewStats(r);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, userType]);

  if (loading) {
    return (
      <section className={`py-20 ${bgColor}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 ${bgColor} relative overflow-hidden w-full`}>
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-gradient-to-br from-primary to-emerald-400 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="w-full px-0 relative z-10">
        <div className="text-left mb-8 px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 rounded-2xl ${accentColor} shadow-xl`}>
              <div className="relative">{icon}</div>
            </div>
            <h2 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent tracking-tight ${isTamil ? 'tamil-text' : ''}`}>
              {typeof title === 'string' ? title : title}
            </h2>
          </div>
        </div>

        <div className="overflow-hidden mb-16 w-full">
          <div className="flex gap-3 animate-scroll-interval">
            {products.slice(0, 12).concat(products.slice(0, 12)).map((product, index) => (
              <div 
                key={`${product.id}-${index}`} 
                className="flex-shrink-0 w-56 sm:w-64"
              >
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-200 bg-white rounded-2xl">
                  <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-50">
                    <Link to={`/product/${product.id}`} className="block cursor-pointer">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full aspect-square object-cover group-hover:scale-105 transition-all duration-300"
                      />
                    </Link>
                    <Button 
                      size="sm" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-lg bg-white/95 hover:bg-white border border-gray-100 hover:border-red-200 p-1.5"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const productId = product.id.toString();
                        isInWishlist(productId) ? removeFromWishlist(productId) : addToWishlist(productId);
                      }}
                    >
                      <Heart className={`w-3 h-3 ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </Button>
                  </div>
                  
                  <CardContent className="p-3 sm:p-4 bg-white">
                    <Link to={`/product/${product.id}`}>
                      <h3 className={`font-bold text-xs sm:text-sm mb-2 group-hover:text-red-600 transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] leading-tight uppercase ${isTamil ? 'tamil-text' : ''}`}>
                        {isTamil && product.tamil ? filterPriceFromName(product.tamil) : filterPriceFromName(product.name)}
                      </h3>
                    </Link>
                    
                    <StarRating 
                      rating={reviewStats[product.id]?.average || 0} 
                      count={reviewStats[product.id]?.count || 0} 
                      size="sm" 
                      showCount={false} 
                    />
                    
                    <div className="mb-2 sm:mb-3">
                      <div className="flex items-baseline gap-1 sm:gap-2">
                        <span className="text-sm sm:text-lg font-black text-green-600">
                          {product.priceRange || formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 sm:gap-2">
                      <Button 
                        className="flex-1 text-gray-800 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg sm:rounded-xl py-1.5 text-xs font-medium min-h-[28px]"
                        style={{background: 'linear-gradient(to right, #e6e6e6, #f2f2f2)'}}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          // For variable products, use the first variation
                          if (product.isVariableProduct && product.variations) {
                            try {
                              const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
                              if (variations && variations.length > 0) {
                                const firstVariation = variations[0];
                                const skuid = firstVariation.skuid || `${product.id}-${firstVariation.value || firstVariation.attributeValue}`;
                                addToCart(skuid, product.id.toString(), 1, product.name, product.price);
                                return;
                              }
                            } catch (e) {
                              console.error('Error parsing variations:', e);
                            }
                          }
                          
                          // For regular products
                          const skuid = product.skuid || product.id.toString();
                          addToCart(skuid, product.id.toString(), 1, product.name, product.price);
                        }}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        <span className="text-xs">{translate('blocks.add')}</span>
                      </Button>
                      
                      <Button 
                        className="flex-1 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-lg sm:rounded-xl py-1.5 text-xs font-medium min-h-[28px]"
                        style={{background: 'linear-gradient(to right, #009108, #55bf57)'}}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          // For variable products, use the first variation
                          if (product.isVariableProduct && product.variations) {
                            try {
                              const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
                              if (variations && variations.length > 0) {
                                const firstVariation = variations[0];
                                const skuid = firstVariation.skuid || `${product.id}-${firstVariation.value || firstVariation.attributeValue}`;
                                const variationName = firstVariation.value || firstVariation.attributeValue || Object.values(firstVariation)[0];
                                
                                buyNow({
                                  id: product.id.toString(),
                                  skuid: skuid,
                                  name: `${product.name} - ${variationName}`,
                                  tamil: product.tamil ? `${product.tamil} - ${variationName}` : null,
                                  price: getPriceByUserType(firstVariation, product.userType || 'customer'),
                                  image: product.image,
                                  category: product.category,
                                  variation: variationName,
                                  quantity: 1
                                });
                                return;
                              }
                            } catch (e) {
                              console.error('Error parsing variations:', e);
                            }
                          }
                          
                          // For regular products
                          const skuid = product.skuid || product.id.toString();
                          buyNow({
                            id: product.id.toString(),
                            skuid: skuid,
                            name: product.name,
                            tamil: product.tamil || null,
                            price: product.price,
                            image: product.image,
                            category: product.category,
                            quantity: 1
                          });
                        }}
                      >
                        <span className="text-xs">{translate('blocks.buy')}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center px-4">
          {products.length > 8 && !showAll ? (
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-primary hover:via-emerald-500 hover:to-primary text-white transition-all duration-500 px-12 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl rounded-2xl transform hover:scale-105 hover:-translate-y-1"
              onClick={() => setShowAll(true)}
            >
              <span className={`${isTamil ? 'tamil-text' : ''} mr-3`}>{translate('blocks.viewAll')}</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
          ) : (
            <Link to={`/products?type=${type}`}>
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-primary hover:via-emerald-500 hover:to-primary text-white transition-all duration-500 px-12 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl rounded-2xl transform hover:scale-105 hover:-translate-y-1"
              >
                <span className={`${isTamil ? 'tamil-text' : ''} mr-3`}>{translate('blocks.viewAll')}</span>
                <Eye className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

// Special Trending Products Component with Carousel Layout
const TrendingProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { data: userType = 'customer' } = useUserType();
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const { buyNow } = useBuyNow();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { products: p, reviewStats: r } = await fetchProductsWithPhotos(
          `${API_URL}/product-masters?filters[type][$eq]=trending&filters[status][$eq]=true&pagination[pageSize]=8`,
          userType
        );
        setProducts(p);
        setReviewStats(r);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userType]);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-white to-emerald-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-br from-teal-400 to-green-500 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-3xl md:text-4xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent ${isTamil ? 'tamil-text' : ''}`}>
              {translate('blocks.trendingProducts')}
            </h2>
          </div>
          <p className={`text-lg text-gray-600 max-w-2xl mx-auto ${isTamil ? 'tamil-text' : ''}`}>
            {translate('blocks.trendingDescription')}
          </p>
        </div>

        {/* 2 Column 4 Row Layout for Mobile, 4 Column 2 Row for Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mx-auto">
          {products.slice(0, 8).map((product, index) => (
            <div 
              key={product.id} 
              className="transform transition-all duration-500 hover:scale-105"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border border-green-100 hover:border-green-200 bg-white rounded-2xl animate-fade-in-up">
                <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50">
                  <Link to={`/product/${product.id}`} className="block cursor-pointer">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-all duration-300"
                    />
                  </Link>
                  <Button 
                    size="sm" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-lg bg-white/95 hover:bg-white border border-gray-100 hover:border-red-200 p-1.5"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const productId = product.id.toString();
                      isInWishlist(productId) ? removeFromWishlist(productId) : addToWishlist(productId);
                    }}
                  >
                    <Heart className={`w-3 h-3 ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </Button>
                </div>
                
                <CardContent className="p-3 bg-white">
                  <Link to={`/product/${product.id}`}>
                    <h3 className={`font-bold text-xs mb-2 group-hover:text-green-600 transition-colors line-clamp-2 min-h-[2rem] leading-tight uppercase ${isTamil ? 'tamil-text' : ''}`}>
                      {isTamil && product.tamil ? filterPriceFromName(product.tamil) : filterPriceFromName(product.name)}
                    </h3>
                  </Link>
                  
                  <StarRating 
                    rating={reviewStats[product.id]?.average || 0} 
                    count={reviewStats[product.id]?.count || 0} 
                    size="sm" 
                    showCount={false} 
                  />
                  
                  <div className="mb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black text-green-600">
                        {product.priceRange || formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      className="flex-1 text-gray-800 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg py-1.5 text-xs font-medium min-h-[28px]"
                      style={{background: 'linear-gradient(to right, #e6e6e6, #f2f2f2)'}}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // For variable products, use the first variation
                        if (product.isVariableProduct && product.variations) {
                          try {
                            const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
                            if (variations && variations.length > 0) {
                              const firstVariation = variations[0];
                              const skuid = firstVariation.skuid || `${product.id}-${firstVariation.value || firstVariation.attributeValue}`;
                              addToCart(skuid, product.id.toString(), 1, product.name, product.price);
                              return;
                            }
                          } catch (e) {
                            console.error('Error parsing variations:', e);
                          }
                        }
                        
                        // For regular products
                        const skuid = product.skuid || product.id.toString();
                        addToCart(skuid, product.id.toString(), 1, product.name, product.price);
                      }}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      <span className="text-xs">{translate('blocks.add')}</span>
                    </Button>
                    
                    <Button 
                      className="flex-1 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-lg py-1.5 text-xs font-medium min-h-[28px]"
                      style={{background: 'linear-gradient(to right, #009108, #55bf57)'}}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // For variable products, use the first variation
                        if (product.isVariableProduct && product.variations) {
                          try {
                            const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
                            if (variations && variations.length > 0) {
                              const firstVariation = variations[0];
                              const skuid = firstVariation.skuid || `${product.id}-${firstVariation.value || firstVariation.attributeValue}`;
                              const variationName = firstVariation.value || firstVariation.attributeValue || Object.values(firstVariation)[0];
                              
                              buyNow({
                                id: product.id.toString(),
                                skuid: skuid,
                                name: `${product.name} - ${variationName}`,
                                tamil: product.tamil ? `${product.tamil} - ${variationName}` : null,
                                price: getPriceByUserType(firstVariation, product.userType || 'customer'),
                                image: product.image,
                                category: product.category,
                                variation: variationName,
                                quantity: 1
                              });
                              return;
                            }
                          } catch (e) {
                            console.error('Error parsing variations:', e);
                          }
                        }
                        
                        // For regular products
                        const skuid = product.skuid || product.id.toString();
                        buyNow({
                          id: product.id.toString(),
                          skuid: skuid,
                          name: product.name,
                          tamil: product.tamil || null,
                          price: product.price,
                          image: product.image,
                          category: product.category,
                          quantity: 1
                        });
                      }}
                    >
                      <span className="text-xs">{translate('blocks.buy')}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link to="/products?type=trending">
            <Button className={`bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${isTamil ? 'tamil-text' : ''}`}>
              {translate('blocks.viewAllTrendingProducts')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Special Deals of the Day Component with Beautiful Layout
const DealsOfTheDaySection = () => {
  const [products, setProducts] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { data: userType = 'customer' } = useUserType();
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const { buyNow } = useBuyNow();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { products: p, reviewStats: r } = await fetchProductsWithPhotos(
          `${API_URL}/product-masters?filters[type][$eq]=deals&filters[status][$eq]=true&pagination[pageSize]=10`,
          userType
        );
        setProducts(p);
        setReviewStats(r);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userType]);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  // Shuffle products and pick random featured deal
  const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
  const featuredDeal = shuffledProducts[0];
  const bottomDeals = shuffledProducts.slice(1, 3);
  const sideDeals = shuffledProducts.slice(3, 7);

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-white to-emerald-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-xl animate-bounce">
              <Tag className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">
              {translate('blocks.dealsOfTheDay')}
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {translate('blocks.dealsDescription')}
          </p>
          <div className="flex justify-center items-center gap-2 mt-4">
            <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
            <div className="w-20 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
            <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
          </div>
        </div>

        {/* 2 Column Layout for Mobile, 4 Column for Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.slice(0, 8).map((product, index) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-green-200">
              <div className="relative overflow-hidden">
                <Link to={`/product/${product.id}`}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold" style={{background: 'linear-gradient(to right, #0a7f06, #4ab748)'}}>
                  🔥 Deal
                </div>
                <Button 
                  size="sm" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-lg bg-white/95 hover:bg-white border border-gray-100 hover:border-red-200 p-1.5"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const productId = product.id.toString();
                    isInWishlist(productId) ? removeFromWishlist(productId) : addToWishlist(productId);
                  }}
                >
                  <Heart className={`w-3 h-3 ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </Button>
              </div>
              
              <div className="p-2 sm:p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className={`font-bold text-[10px] sm:text-sm text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2 mb-1 sm:mb-2 uppercase ${isTamil ? 'tamil-text' : ''}`}>
                    {isTamil && product.tamil ? filterPriceFromName(product.tamil) : filterPriceFromName(product.name)}
                  </h3>
                </Link>
                
                <StarRating 
                  rating={reviewStats[product.id]?.average || 0} 
                  count={reviewStats[product.id]?.count || 0} 
                  size="sm" 
                  showCount={false} 
                />
                
                <div className="mb-2 sm:mb-3">
                  <span className="text-sm sm:text-lg font-black" style={{color: '#0a7f06'}}>
                    {product.priceRange || formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <div className="text-[10px] sm:text-xs text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-3">
                    <Button 
                      className="flex-1 text-gray-800 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg sm:rounded-xl py-1.5 text-xs font-medium min-h-[28px]"
                      style={{background: 'linear-gradient(to right, #e6e6e6, #f2f2f2)'}}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      if (product.isVariableProduct && product.variations) {
                        try {
                          const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
                          if (variations && variations.length > 0) {
                            const firstVariation = variations[0];
                            const skuid = firstVariation.skuid || `${product.id}-${firstVariation.value || firstVariation.attributeValue}`;
                            addToCart(skuid, product.id.toString(), 1, product.name, product.price);
                            return;
                          }
                        } catch (e) {
                          console.error('Error parsing variations:', e);
                        }
                      }
                      
                      const skuid = product.skuid || product.id.toString();
                      addToCart(skuid, product.id.toString(), 1, product.name, product.price);
                    }}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    <span className="text-xs">{translate('blocks.add')}</span>
                  </Button>
                  
                  <Button 
                    className="flex-1 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-lg py-1.5 text-xs font-medium min-h-[28px]"
                    style={{background: 'linear-gradient(to right, #009108, #55bf57)'}}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      if (product.isVariableProduct && product.variations) {
                        try {
                          const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
                          if (variations && variations.length > 0) {
                            const firstVariation = variations[0];
                            const skuid = firstVariation.skuid || `${product.id}-${firstVariation.value || firstVariation.attributeValue}`;
                            const variationName = firstVariation.value || firstVariation.attributeValue || Object.values(firstVariation)[0];
                            
                            buyNow({
                              id: product.id.toString(),
                              skuid: skuid,
                              name: `${product.name} - ${variationName}`,
                              tamil: product.tamil ? `${product.tamil} - ${variationName}` : null,
                              price: getPriceByUserType(firstVariation, product.userType || 'customer'),
                              image: product.image,
                              category: product.category,
                              variation: variationName,
                              quantity: 1
                            });
                            return;
                          }
                        } catch (e) {
                          console.error('Error parsing variations:', e);
                        }
                      }
                      
                      const skuid = product.skuid || product.id.toString();
                      buyNow({
                        id: product.id.toString(),
                        skuid: skuid,
                        name: product.name,
                        tamil: product.tamil || null,
                        price: product.price,
                        image: product.image,
                        category: product.category,
                        quantity: 1
                      });
                    }}
                  >
                    <span className="text-xs">{translate('blocks.buy')}</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Banner Section Component
const BannerSection = () => {
  const navigate = useNavigate();
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <img 
              src="https://api.dharaniherbbals.com/uploads/banner2_39ccfbe393.jpeg" 
              alt="Banner 2"
              className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
          <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <img 
              src="https://api.dharaniherbbals.com/uploads/banner1_ab2f205e87.jpeg" 
              alt="Banner 1"
              className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
          <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <img 
              src="https://api.dharaniherbbals.com/uploads/banner3_85772766ca.jpg" 
              alt="Banner 3"
              className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Popular Choices Section with Masonry Layout
const PopularChoicesSection = () => {
  const [products, setProducts] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { data: userType = 'customer' } = useUserType();
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const { buyNow } = useBuyNow();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { products: p, reviewStats: r } = await fetchProductsWithPhotos(
          `${API_URL}/product-masters?filters[type][$eq]=popular&filters[status][$eq]=true&pagination[pageSize]=8`,
          userType
        );
        setProducts(p);
        setReviewStats(r);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userType]);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;



  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-white to-green-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-br from-teal-400 to-green-500 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-2 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-3xl md:text-4xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent ${isTamil ? 'tamil-text' : ''}`}>
              {translate('blocks.popularChoices')}
            </h2>
          </div>
          <p className={`text-lg text-gray-600 max-w-2xl mx-auto ${isTamil ? 'tamil-text' : ''}`}>
            {translate('blocks.popularDescription')}
          </p>
        </div>

        {/* 2 Column 4 Row Layout for Mobile, 4 Column 2 Row for Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {products.slice(0, 8).map((product, index) => (
            <div key={product.id}>
              <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border border-green-100 hover:border-green-200 bg-white rounded-2xl">
                <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50">
                  <Link to={`/product/${product.id}`} className="block cursor-pointer">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full aspect-square object-contain group-hover:scale-105 transition-transform duration-300 p-2 sm:p-3"
                    />
                  </Link>
                  <Button 
                    size="sm" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-lg bg-white/95 hover:bg-white border border-gray-100 hover:border-red-200 p-1.5"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const productId = product.id.toString();
                      isInWishlist(productId) ? removeFromWishlist(productId) : addToWishlist(productId);
                    }}
                  >
                    <Heart className={`w-3 h-3 ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </Button>
                </div>
                
                <CardContent className="p-2 sm:p-3 bg-white">
                  <Link to={`/product/${product.id}`}>
                    <h3 className={`font-bold text-[10px] sm:text-xs mb-1 sm:mb-2 group-hover:text-green-600 transition-colors line-clamp-2 min-h-[1.5rem] sm:min-h-[2rem] uppercase ${isTamil ? 'tamil-text' : ''}`}>
                      {isTamil && product.tamil ? filterPriceFromName(product.tamil) : filterPriceFromName(product.name)}
                    </h3>
                  </Link>
                  
                  <StarRating 
                    rating={reviewStats[product.id]?.average || 0} 
                    count={reviewStats[product.id]?.count || 0} 
                    size="sm" 
                    showCount={false} 
                  />
                  
                  <div className="mb-1 sm:mb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs sm:text-sm font-black text-green-600">
                        {product.priceRange || formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      className="flex-1 text-gray-800 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg py-1.5 text-xs font-medium min-h-[28px]"
                      style={{background: 'linear-gradient(to right, #e6e6e6, #f2f2f2)'}}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // For variable products, use the first variation
                        if (product.isVariableProduct && product.variations) {
                          try {
                            const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
                            if (variations && variations.length > 0) {
                              const firstVariation = variations[0];
                              const skuid = firstVariation.skuid || `${product.id}-${firstVariation.value || firstVariation.attributeValue}`;
                              addToCart(skuid, product.id.toString(), 1, product.name, product.price);
                              return;
                            }
                          } catch (e) {
                            console.error('Error parsing variations:', e);
                          }
                        }
                        
                        // For regular products
                        const skuid = product.skuid || product.id.toString();
                        addToCart(skuid, product.id.toString(), 1, product.name, product.price);
                      }}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      <span className="text-xs">{translate('blocks.add')}</span>
                    </Button>
                    
                    <Button 
                      className="flex-1 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-lg py-1.5 text-xs font-medium min-h-[28px]"
                      style={{background: 'linear-gradient(to right, #009108, #55bf57)'}}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // For variable products, use the first variation
                        if (product.isVariableProduct && product.variations) {
                          try {
                            const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
                            if (variations && variations.length > 0) {
                              const firstVariation = variations[0];
                              const skuid = firstVariation.skuid || `${product.id}-${firstVariation.value || firstVariation.attributeValue}`;
                              const variationName = firstVariation.value || firstVariation.attributeValue || Object.values(firstVariation)[0];
                              
                              buyNow({
                                id: product.id.toString(),
                                skuid: skuid,
                                name: `${product.name} - ${variationName}`,
                                tamil: product.tamil ? `${product.tamil} - ${variationName}` : null,
                                price: getPriceByUserType(firstVariation, product.userType || 'customer'),
                                image: product.image,
                                category: product.category,
                                variation: variationName,
                                quantity: 1
                              });
                              return;
                            }
                          } catch (e) {
                            console.error('Error parsing variations:', e);
                          }
                        }
                        
                        // For regular products
                        const skuid = product.skuid || product.id.toString();
                        buyNow({
                          id: product.id.toString(),
                          skuid: skuid,
                          name: product.name,
                          tamil: product.tamil || null,
                          price: product.price,
                          image: product.image,
                          category: product.category,
                          quantity: 1
                        });
                      }}
                    >
                      <span className="text-xs">{translate('blocks.buy')}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/products?type=popular">
            <Button className={`bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${isTamil ? 'tamil-text' : ''}`}>
              {translate('blocks.viewAllPopularProducts')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Main Component with all Product Blocks
const ProductBlocks = () => {
  const { translate } = useTranslation();
  return (
    <>
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scroll-interval {
          0%, 16.66% {
            transform: translateX(0);
          }
          33.33%, 50% {
            transform: translateX(-272px);
          }
          66.66%, 83.33% {
            transform: translateX(-544px);
          }
          100% {
            transform: translateX(-816px);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .animate-scroll-interval {
          animation: scroll-interval 12s ease-in-out infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      
      <DealsOfTheDaySection />
      
      <TrendingProductsSection />
      
      <BannerSection />
      
      <ProductBlock 
        type="hot"
        title={translate('blocks.hotSelling')} 
        description={translate('blocks.hotDescription')}
        icon={<Flame className="w-8 h-8 text-white" />}
        bgColor="bg-gradient-to-br from-red-50 via-white to-red-100"
        accentColor="bg-gradient-to-r from-red-500 to-red-600"
      />
      
      <PopularChoicesSection />
    </>
  );
};

export default ProductBlocks;