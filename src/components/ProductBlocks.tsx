import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart, TrendingUp, Flame, Zap, Tag, ArrowRight, Eye } from 'lucide-react';
import StarRating from './StarRating';
import { useWishlistContext } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useQuickCheckout } from '@/contexts/QuickCheckoutContext';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useTranslation, LANGUAGES } from './TranslationProvider';
import { getBulkProductReviewStats } from '@/services/reviews';
import { useAuth } from '@/contexts/AuthContext';
import { getPriceByUserType, getVariablePriceRange } from '@/lib/pricing';
import { filterPriceFromName } from '@/lib/productUtils';

// Product Card Component
const ProductCard = ({ product, reviewStats = {} }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();
  const { addToCart } = useCart();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const navigate = useNavigate();
  const { language, translate } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  const handleWishlistToggle = () => {
    let skuid;
    
    // For variable products, use first variation's SKU
    if (product.isVariableProduct && product.variations) {
      try {
        const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
        if (variations && variations.length > 0) {
          const firstVariation = variations[0];
          skuid = firstVariation.skuid || `${product.id}-${firstVariation.value || firstVariation.attributeValue}`;
        } else {
          skuid = product.skuid || product.SKUID || product.id.toString();
        }
      } catch (e) {
        skuid = product.skuid || product.SKUID || product.id.toString();
      }
    } else {
      skuid = product.skuid || product.SKUID || product.id.toString();
    }

    if (isInWishlist(skuid)) {
      removeFromWishlist(skuid);
    } else {
      addToWishlist(skuid);
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
          addToCart(skuid, product.id.toString(), 1);
          return;
        }
      } catch (e) {
        console.error('Error parsing variations:', e);
      }
    }
    
    // For regular products
    const skuid = product.skuid || product.id.toString();
    addToCart(skuid, product.id.toString(), 1);
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
          
          setQuickCheckoutItem({
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
          navigate('/checkout');
          return;
        }
      } catch (e) {
        console.error('Error parsing variations:', e);
      }
    }
    
    // For regular products
    const skuid = product.skuid || product.id.toString();
    setQuickCheckoutItem({
      id: product.id.toString(),
      skuid: skuid,
      name: product.name,
      tamil: product.tamil || null,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1
    });
    navigate('/checkout');
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
          <Heart className={`w-4 h-4 transition-colors ${(() => {
            let checkSkuid;
            if (product.isVariableProduct && product.variations) {
              try {
                const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
                if (variations && variations.length > 0) {
                  const firstVariation = variations[0];
                  checkSkuid = firstVariation.skuid || `${product.id}-${firstVariation.value || firstVariation.attributeValue}`;
                } else {
                  checkSkuid = product.skuid || product.SKUID || product.id.toString();
                }
              } catch (e) {
                checkSkuid = product.skuid || product.SKUID || product.id.toString();
              }
            } else {
              checkSkuid = product.skuid || product.SKUID || product.id.toString();
            }
            return isInWishlist(checkSkuid) ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500';
          })()} `} />
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
  const [userType, setUserType] = useState('customer');
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuth();
  const { language, translate } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setQuickCheckoutItem } = useQuickCheckout();

  // Always fetch fresh user type from API - exactly like AllProducts page
  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const timestamp = new Date().getTime();
          const response = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userData.id}?timestamp=${timestamp}`);
          if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.attributes) {
              const newUserType = result.data.attributes.userType || 'customer';
              
              setUserType(newUserType);
              return;
            }
          }
        }
        setUserType('customer');
      } catch (error) {
        
        setUserType('customer');
      }
    };
    fetchUserType();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?filters[type][$eq]=${type}&filters[status][$eq]=true&pagination[pageSize]=20&timestamp=${timestamp}`);
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        let productList = [];
        if (Array.isArray(data)) {
          productList = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          productList = data.data;
        }
        
        // Products are already filtered by API, no need to filter again
        const filteredProducts = productList;
        
        const formattedProducts = filteredProducts.map(item => {
          const attributes = item.attributes || item;
          // Use the userType from state - exactly like AllProducts page
          const currentUserType = userType || 'customer';
          
          
          let price = getPriceByUserType(attributes, currentUserType);
          
          let priceRange = null;
          
          if (attributes.isVariableProduct && attributes.variations) {
            try {
              const variations = typeof attributes.variations === 'string' ? JSON.parse(attributes.variations) : attributes.variations;
              
              // Calculate price range for each variation based on user type
              const prices = variations.map(variation => getPriceByUserType(variation, currentUserType));
              
              if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                
                price = minPrice; // Use min price as default
                priceRange = minPrice === maxPrice ? 
                  formatPrice(minPrice) : 
                  `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
                  
                
              }
            } catch (e) {
              
              // Keep default price
            }
          }
          
          return {
            id: item.id || Math.random().toString(),
            name: attributes.Name || attributes.name || 'Product',
            tamil: attributes.tamil || null,
            price: price,
            priceRange: priceRange,
            image: attributes.photo || attributes.image || 'https://via.placeholder.com/300x300?text=Product',
            rating: attributes.rating || 4,
            reviews: attributes.reviews || 10,
            badge: attributes.type || type,
            originalPrice: attributes.originalPrice || null,
            category: attributes.category,
            skuid: attributes.skuid || attributes.SKUID,
            isVariableProduct: attributes.isVariableProduct,
            variations: attributes.variations,
            userType: userType || 'customer'
          };
        });
        
        setProducts(formattedProducts);
        
        // Fetch review stats
        const productIds = formattedProducts.map(p => parseInt(p.id)).filter(id => !isNaN(id));
        if (productIds.length > 0) {
          try {
            const stats = await getBulkProductReviewStats(productIds);
            setReviewStats(stats);
          } catch (reviewError) {
            
          }
        }
      } catch (err) {
        
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
          <div className="flex gap-4 animate-scroll-interval">
            {products.slice(0, 12).concat(products.slice(0, 12)).map((product, index) => (
              <div 
                key={`${product.id}-${index}`} 
                className="flex-shrink-0 w-64"
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
                  </div>
                  
                  <CardContent className="p-4 bg-white">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-bold text-sm mb-2 group-hover:text-red-600 transition-colors line-clamp-2 min-h-[2.5rem] leading-tight uppercase">
                        {filterPriceFromName(product.name)}
                      </h3>
                    </Link>
                    
                    <StarRating 
                      rating={reviewStats[product.id]?.average || 0} 
                      count={reviewStats[product.id]?.count || 0} 
                      size="sm" 
                      showCount={false} 
                    />
                    
                    <div className="mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-green-600">
                          {product.priceRange || formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl py-1.5 text-xs font-medium"
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
                                addToCart(skuid, product.id.toString(), 1);
                                return;
                              }
                            } catch (e) {
                              console.error('Error parsing variations:', e);
                            }
                          }
                          
                          // For regular products
                          const skuid = product.skuid || product.id.toString();
                          addToCart(skuid, product.id.toString(), 1);
                        }}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Add to Cart
                      </Button>
                      
                      <Button 
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl py-1.5 text-xs font-medium"
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
                                
                                setQuickCheckoutItem({
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
                                navigate('/checkout');
                                return;
                              }
                            } catch (e) {
                              console.error('Error parsing variations:', e);
                            }
                          }
                          
                          // For regular products
                          const skuid = product.skuid || product.id.toString();
                          setQuickCheckoutItem({
                            id: product.id.toString(),
                            skuid: skuid,
                            name: product.name,
                            tamil: product.tamil || null,
                            price: product.price,
                            image: product.image,
                            category: product.category,
                            quantity: 1
                          });
                          navigate('/checkout');
                        }}
                      >
                        Buy Now
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
  const [userType, setUserType] = useState('customer');
  const { user } = useAuth();
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setQuickCheckoutItem } = useQuickCheckout();

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const timestamp = new Date().getTime();
          const response = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userData.id}?timestamp=${timestamp}`);
          if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.attributes) {
              setUserType(result.data.attributes.userType || 'customer');
              return;
            }
          }
        }
        setUserType('customer');
      } catch (error) {
        setUserType('customer');
      }
    };
    fetchUserType();
  }, []);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const timestamp = new Date().getTime();
        const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?filters[type][$eq]=trending&filters[status][$eq]=true&pagination[pageSize]=8&timestamp=${timestamp}`);
        
        if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
        
        const data = await response.json();
        let productList = Array.isArray(data) ? data : (data?.data || []);
        
        const formattedProducts = productList.map(item => {
          const attributes = item.attributes || item;
          const currentUserType = userType || 'customer';
          
          let price = getPriceByUserType(attributes, currentUserType);
          let priceRange = null;
          
          if (attributes.isVariableProduct && attributes.variations) {
            try {
              const variations = typeof attributes.variations === 'string' ? JSON.parse(attributes.variations) : attributes.variations;
              const prices = variations.map(variation => getPriceByUserType(variation, currentUserType));
              
              if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                price = minPrice;
                priceRange = minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
              }
            } catch (e) {
              // Keep default price
            }
          }
          
          return {
            id: item.id || Math.random().toString(),
            name: attributes.Name || attributes.name || 'Product',
            tamil: attributes.tamil || null,
            price: price,
            priceRange: priceRange,
            image: attributes.photo || attributes.image || 'https://via.placeholder.com/300x300?text=Product',
            originalPrice: attributes.originalPrice || null,
            category: attributes.category,
            skuid: attributes.skuid || attributes.SKUID,
            isVariableProduct: attributes.isVariableProduct,
            variations: attributes.variations,
            userType: userType || 'customer'
          };
        });
        
        setProducts(formattedProducts);
        
        const productIds = formattedProducts.map(p => parseInt(p.id)).filter(id => !isNaN(id));
        if (productIds.length > 0) {
          try {
            const stats = await getBulkProductReviewStats(productIds);
            setReviewStats(stats);
          } catch (reviewError) {
            // Handle error
          }
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
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

        {/* 4 Column 2 Row Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
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
                      className={`flex-1 bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-lg py-1.5 text-xs font-medium min-h-[28px] ${isTamil ? 'tamil-text' : ''}`}
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
                              addToCart(skuid, product.id.toString(), 1);
                              return;
                            }
                          } catch (e) {
                            console.error('Error parsing variations:', e);
                          }
                        }
                        
                        // For regular products
                        const skuid = product.skuid || product.id.toString();
                        addToCart(skuid, product.id.toString(), 1);
                      }}
                    >
                      <ShoppingCart className="w-2 h-2 mr-1" />
                      {translate('blocks.add')}
                    </Button>
                    
                    <Button 
                      className={`flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-lg py-1.5 text-xs font-medium min-h-[28px] ${isTamil ? 'tamil-text' : ''}`}
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
                              
                              setQuickCheckoutItem({
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
                              navigate('/checkout');
                              return;
                            }
                          } catch (e) {
                            console.error('Error parsing variations:', e);
                          }
                        }
                        
                        // For regular products
                        const skuid = product.skuid || product.id.toString();
                        setQuickCheckoutItem({
                          id: product.id.toString(),
                          skuid: skuid,
                          name: product.name,
                          tamil: product.tamil || null,
                          price: product.price,
                          image: product.image,
                          category: product.category,
                          quantity: 1
                        });
                        navigate('/checkout');
                      }}
                    >
                      {translate('blocks.buy')}
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
  const [userType, setUserType] = useState('customer');
  const { user } = useAuth();
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const timestamp = new Date().getTime();
          const response = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userData.id}?timestamp=${timestamp}`);
          if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.attributes) {
              setUserType(result.data.attributes.userType || 'customer');
              return;
            }
          }
        }
        setUserType('customer');
      } catch (error) {
        setUserType('customer');
      }
    };
    fetchUserType();
  }, []);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const timestamp = new Date().getTime();
        const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?filters[type][$eq]=deals&filters[status][$eq]=true&pagination[pageSize]=10&timestamp=${timestamp}`);
        
        if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
        
        const data = await response.json();
        let productList = Array.isArray(data) ? data : (data?.data || []);
        
        const formattedProducts = productList.map(item => {
          const attributes = item.attributes || item;
          const currentUserType = userType || 'customer';
          
          let price = getPriceByUserType(attributes, currentUserType);
          let priceRange = null;
          
          if (attributes.isVariableProduct && attributes.variations) {
            try {
              const variations = typeof attributes.variations === 'string' ? JSON.parse(attributes.variations) : attributes.variations;
              const prices = variations.map(variation => getPriceByUserType(variation, currentUserType));
              
              if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                price = minPrice;
                priceRange = minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
              }
            } catch (e) {
              // Keep default price
            }
          }
          
          return {
            id: item.id || Math.random().toString(),
            name: attributes.Name || attributes.name || 'Product',
            tamil: attributes.tamil || null,
            price: price,
            priceRange: priceRange,
            image: attributes.photo || attributes.image || 'https://via.placeholder.com/300x300?text=Product',
            originalPrice: attributes.originalPrice || null,
            category: attributes.category,
            skuid: attributes.skuid || attributes.SKUID,
            isVariableProduct: attributes.isVariableProduct,
            variations: attributes.variations,
            userType: userType || 'customer'
          };
        });
        
        setProducts(formattedProducts);
        
        const productIds = formattedProducts.map(p => parseInt(p.id)).filter(id => !isNaN(id));
        if (productIds.length > 0) {
          try {
            const stats = await getBulkProductReviewStats(productIds);
            setReviewStats(stats);
          } catch (reviewError) {
            // Handle error
          }
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
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
    <section className="py-16 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl animate-bounce">
              <Tag className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
              {translate('blocks.dealsOfTheDay')}
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {translate('blocks.dealsDescription')}
          </p>
          <div className="flex justify-center items-center gap-2 mt-4">
            <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            <div className="w-20 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
            <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
          </div>
        </div>

        {/* Simple Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product, index) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-red-200">
              <div className="relative overflow-hidden">
                <Link to={`/product/${product.id}`}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  🔥 Deal
                </div>
              </div>
              
              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className={`font-bold text-sm text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2 mb-2 uppercase ${isTamil ? 'tamil-text' : ''}`}>
                    {isTamil && product.tamil ? filterPriceFromName(product.tamil) : filterPriceFromName(product.name)}
                  </h3>
                </Link>
                
                <StarRating 
                  rating={reviewStats[product.id]?.average || 0} 
                  count={reviewStats[product.id]?.count || 0} 
                  size="sm" 
                  showCount={false} 
                />
                
                <div className="mb-3">
                  <span className="text-lg font-black text-red-600">
                    {product.priceRange || formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <div className="text-xs text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button 
                    className={`flex-1 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl py-1.5 text-xs font-medium ${isTamil ? 'tamil-text' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      if (product.isVariableProduct && product.variations) {
                        try {
                          const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
                          if (variations && variations.length > 0) {
                            const firstVariation = variations[0];
                            const skuid = firstVariation.skuid || `${product.id}-${firstVariation.value || firstVariation.attributeValue}`;
                            addToCart(skuid, product.id.toString(), 1);
                            return;
                          }
                        } catch (e) {
                          console.error('Error parsing variations:', e);
                        }
                      }
                      
                      const skuid = product.skuid || product.id.toString();
                      addToCart(skuid, product.id.toString(), 1);
                    }}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Add to Cart
                  </Button>
                  
                  <Button 
                    className={`flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl py-1.5 text-xs font-medium ${isTamil ? 'tamil-text' : ''}`}
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
                            
                            setQuickCheckoutItem({
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
                            navigate('/checkout');
                            return;
                          }
                        } catch (e) {
                          console.error('Error parsing variations:', e);
                        }
                      }
                      
                      const skuid = product.skuid || product.id.toString();
                      setQuickCheckoutItem({
                        id: product.id.toString(),
                        skuid: skuid,
                        name: product.name,
                        tamil: product.tamil || null,
                        price: product.price,
                        image: product.image,
                        category: product.category,
                        quantity: 1
                      });
                      navigate('/checkout');
                    }}
                  >
                    Buy Now
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
              src="https://api.dharaniherbbals.com/uploads/chembaruthi_shampoo_560498fde2.jpg" 
              alt="Chembaruthi Shampoo"
              className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Button 
                className={`bg-white text-black hover:bg-gray-100 font-bold px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ${isTamil ? 'tamil-text' : ''}`}
                onClick={() => navigate('/products')}
              >
                {translate('blocks.shopNow')}
              </Button>
            </div>
          </div>
          <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <img 
              src="https://api.dharaniherbbals.com/uploads/vettiver_shampoo_7c1e9441da.jpg" 
              alt="Vettiver Shampoo"
              className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Button 
                className={`bg-white text-black hover:bg-gray-100 font-bold px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ${isTamil ? 'tamil-text' : ''}`}
                onClick={() => navigate('/products')}
              >
                {translate('blocks.shopNow')}
              </Button>
            </div>
          </div>
          <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <img 
              src="https://api.dharaniherbbals.com/uploads/Aloe_vera_shampoo_1c6082e683.jpg" 
              alt="Aloe Vera Shampoo"
              className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Button 
                className={`bg-white text-black hover:bg-gray-100 font-bold px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ${isTamil ? 'tamil-text' : ''}`}
                onClick={() => navigate('/products')}
              >
                {translate('blocks.shopNow')}
              </Button>
            </div>
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
  const [userType, setUserType] = useState('customer');
  const { user } = useAuth();
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setQuickCheckoutItem } = useQuickCheckout();

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const timestamp = new Date().getTime();
          const response = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userData.id}?timestamp=${timestamp}`);
          if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.attributes) {
              setUserType(result.data.attributes.userType || 'customer');
              return;
            }
          }
        }
        setUserType('customer');
      } catch (error) {
        setUserType('customer');
      }
    };
    fetchUserType();
  }, []);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setLoading(true);
        const timestamp = new Date().getTime();
        const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?filters[type][$eq]=popular&filters[status][$eq]=true&pagination[pageSize]=8&timestamp=${timestamp}`);
        
        if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
        
        const data = await response.json();
        let productList = Array.isArray(data) ? data : (data?.data || []);
        
        const formattedProducts = productList.map(item => {
          const attributes = item.attributes || item;
          const currentUserType = userType || 'customer';
          
          let price = getPriceByUserType(attributes, currentUserType);
          let priceRange = null;
          
          if (attributes.isVariableProduct && attributes.variations) {
            try {
              const variations = typeof attributes.variations === 'string' ? JSON.parse(attributes.variations) : attributes.variations;
              const prices = variations.map(variation => getPriceByUserType(variation, currentUserType));
              
              if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                price = minPrice;
                priceRange = minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
              }
            } catch (e) {
              // Keep default price
            }
          }
          
          return {
            id: item.id || Math.random().toString(),
            name: attributes.Name || attributes.name || 'Product',
            tamil: attributes.tamil || null,
            price: price,
            priceRange: priceRange,
            image: attributes.photo || attributes.image || 'https://via.placeholder.com/300x300?text=Product',
            originalPrice: attributes.originalPrice || null,
            category: attributes.category,
            skuid: attributes.skuid || attributes.SKUID,
            isVariableProduct: attributes.isVariableProduct,
            variations: attributes.variations,
            userType: userType || 'customer'
          };
        });
        
        setProducts(formattedProducts);
        
        const productIds = formattedProducts.map(p => parseInt(p.id)).filter(id => !isNaN(id));
        if (productIds.length > 0) {
          try {
            const stats = await getBulkProductReviewStats(productIds);
            setReviewStats(stats);
          } catch (reviewError) {
            // Handle error
          }
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
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

        {/* 4 Column Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product, index) => (
            <div key={product.id}>
              <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border border-green-100 hover:border-green-200 bg-white rounded-2xl">
                <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50">
                  <Link to={`/product/${product.id}`} className="block cursor-pointer">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full aspect-square object-contain group-hover:scale-105 transition-transform duration-300 p-3"
                    />
                  </Link>
                </div>
                
                <CardContent className="p-3 bg-white">
                  <Link to={`/product/${product.id}`}>
                    <h3 className={`font-bold text-xs mb-2 group-hover:text-green-600 transition-colors line-clamp-2 min-h-[2rem] uppercase ${isTamil ? 'tamil-text' : ''}`}>
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
                      className={`flex-1 bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-lg py-1 text-xs font-medium ${isTamil ? 'tamil-text' : ''}`}
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
                              addToCart(skuid, product.id.toString(), 1);
                              return;
                            }
                          } catch (e) {
                            console.error('Error parsing variations:', e);
                          }
                        }
                        
                        // For regular products
                        const skuid = product.skuid || product.id.toString();
                        addToCart(skuid, product.id.toString(), 1);
                      }}
                    >
                      <ShoppingCart className="w-2 h-2 mr-1" />
                      {translate('blocks.add')}
                    </Button>
                    
                    <Button 
                      className={`flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-lg py-1 text-xs font-medium ${isTamil ? 'tamil-text' : ''}`}
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
                              
                              setQuickCheckoutItem({
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
                              navigate('/checkout');
                              return;
                            }
                          } catch (e) {
                            console.error('Error parsing variations:', e);
                          }
                        }
                        
                        // For regular products
                        const skuid = product.skuid || product.id.toString();
                        setQuickCheckoutItem({
                          id: product.id.toString(),
                          skuid: skuid,
                          name: product.name,
                          tamil: product.tamil || null,
                          price: product.price,
                          image: product.image,
                          category: product.category,
                          quantity: 1
                        });
                        navigate('/checkout');
                      }}
                    >
                      {translate('blocks.buy')}
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
      <style jsx>{`
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