import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart, TrendingUp, Flame, Zap, Tag, ArrowRight, Eye } from 'lucide-react';
import StarRating from './StarRating';
import { useWishlist } from '@/contexts/WishlistContext';
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
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const navigate = useNavigate();
  const { language, translate } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  const handleWishlistToggle = () => {
    const productData = {
      id: product.id.toString(),
      name: product.name,
      tamil: product.tamil || null,
      price: product.price || 0,
      image: product.image,
      category: product.category
    };

    if (isInWishlist(productData.id)) {
      removeFromWishlist(productData.id);
    } else {
      addToWishlist(productData);
    }
  };

  const handleAddToCart = () => {
    // For variable products, use the first variation - exactly like AllProducts page
    if (product.isVariableProduct && product.variations) {
      try {
        const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
        if (variations && variations.length > 0) {
          const firstVariation = variations[0];
          addToCart({
            id: product.id.toString(),
            name: `${product.name} - ${firstVariation.attributeValue}`,
            tamil: product.tamil ? `${product.tamil} - ${firstVariation.attributeValue}` : null,
            price: getPriceByUserType(firstVariation, product.userType || 'customer'),
            image: product.image,
            category: product.category,
            skuid: firstVariation.skuid || product.skuid || product.id.toString(),
            variation: firstVariation.attributeValue
          });
          return;
        }
      } catch (e) {
        
      }
    }
    
    // For regular products
    addToCart({
      id: product.id.toString(),
      name: product.name,
      tamil: product.tamil || null,
      price: product.price || 0,
      image: product.image,
      category: product.category,
      skuid: product.skuid || product.id.toString()
    });
  };
  
  const handleBuyNow = () => {
    // For variable products, use the first variation - exactly like AllProducts page
    if (product.isVariableProduct && product.variations) {
      try {
        const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
        if (variations && variations.length > 0) {
          const firstVariation = variations[0];
          setQuickCheckoutItem({
            id: product.id.toString(),
            name: `${product.name} - ${firstVariation.attributeValue}`,
            tamil: product.tamil ? `${product.tamil} - ${firstVariation.attributeValue}` : null,
            price: getPriceByUserType(firstVariation, product.userType || 'customer'),
            image: product.image,
            category: product.category,
            skuid: firstVariation.skuid || product.skuid || product.id.toString(),
            variation: firstVariation.attributeValue,
            quantity: 1
          });
          navigate('/checkout');
          return;
        }
      } catch (e) {
        
      }
    }
    
    // For regular products
    setQuickCheckoutItem({
      id: product.id.toString(),
      name: product.name,
      tamil: product.tamil || null,
      price: product.price,
      image: product.image,
      category: product.category,
      skuid: product.skuid || product.id.toString(),
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
            className="w-full h-56 object-contain group-hover:scale-105 transition-all duration-300 p-6"
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
          <Heart className={`w-4 h-4 transition-colors ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`} />
        </Button>
      </div>
      
      <CardContent className="p-6 bg-white">
        <Link to={`/product/${product.id}`}>
          <h3 className={`font-bold text-base mb-3 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem] leading-tight ${isTamil ? 'tamil-text' : ''}`}>
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

  // Always fetch fresh user type from API - exactly like AllProducts page
  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const timestamp = new Date().getTime();
          const response = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userData.id}?timestamp=${timestamp}`, {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
            }
          });
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
        const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?filters[type][$eq]=${type}&filters[status][$eq]=true&pagination[pageSize]=8&timestamp=${timestamp}`);
        
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
    <section className={`py-12 ${bgColor} relative overflow-hidden`}>
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-gradient-to-br from-primary to-emerald-400 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex flex-col items-center mb-8">
            <div className={`p-6 rounded-3xl ${accentColor} shadow-2xl mb-6 transform hover:scale-110 hover:rotate-6 transition-all duration-500 relative`}>
              <div className="absolute inset-0 rounded-3xl bg-white/20 blur-xl"></div>
              <div className="relative">{icon}</div>
            </div>
            <h2 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-4 tracking-tight ${isTamil ? 'tamil-text' : ''}`}>
              {typeof title === 'string' ? title : title}
            </h2>
            <p className={`text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
              {typeof description === 'string' ? description : description}
            </p>
          </div>
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-8 h-1 bg-gradient-to-r from-primary to-emerald-400 rounded-full"></div>
            <div className="w-16 h-2 bg-gradient-to-r from-primary via-emerald-400 to-primary rounded-full"></div>
            <div className="w-8 h-1 bg-gradient-to-r from-emerald-400 to-primary rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 mb-16">
          {(showAll ? products : products.slice(0, 8)).map((product, index) => (
            <div 
              key={product.id} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <ProductCard product={product} reviewStats={reviewStats} />
            </div>
          ))}
        </div>

        <div className="text-center">
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
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      
      <ProductBlock 
        type="deals"
        title={translate('blocks.dealsOfTheDay')} 
        description={translate('blocks.dealsDescription')}
        icon={<Tag className="w-8 h-8 text-white" />}
        bgColor="bg-gradient-to-br from-purple-50 via-white to-purple-100"
        accentColor="bg-gradient-to-r from-purple-500 to-purple-600"
      />
      
      <ProductBlock 
        type="trending"
        title={translate('blocks.trendingProducts')} 
        description={translate('blocks.trendingDescription')}
        icon={<TrendingUp className="w-8 h-8 text-white" />}
        bgColor="bg-gradient-to-br from-blue-50 via-white to-blue-100"
        accentColor="bg-gradient-to-r from-blue-500 to-blue-600"
      />
      
      <ProductBlock 
        type="hot"
        title={translate('blocks.hotSelling')} 
        description={translate('blocks.hotDescription')}
        icon={<Flame className="w-8 h-8 text-white" />}
        bgColor="bg-gradient-to-br from-red-50 via-white to-red-100"
        accentColor="bg-gradient-to-r from-red-500 to-red-600"
      />
      
      <ProductBlock 
        type="popular"
        title={translate('blocks.popularChoices')} 
        description={translate('blocks.popularDescription')}
        icon={<Zap className="w-8 h-8 text-white" />}
        bgColor="bg-gradient-to-br from-green-50 via-white to-green-100"
        accentColor="bg-gradient-to-r from-green-500 to-green-600"
      />
    </>
  );
};

export default ProductBlocks;