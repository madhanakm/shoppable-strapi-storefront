import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { getPriceByUserType } from '@/lib/pricing';
import { filterPriceFromName } from '@/lib/productUtils';
import { useTranslation, LANGUAGES } from './TranslationProvider';
import { getProductsWithTamil } from '@/services/products';
import { getBulkProductReviewStats } from '@/services/reviews';
import StarRating from './StarRating';
import { LoadingWithStatus, RealTimeLoadingStatus } from './ProductSkeleton';
import { useLoadingProgress, LOADING_CONFIGS } from '@/hooks/use-loading-progress';

// Fallback products in case API fails
const fallbackProducts = [
  {
    id: '1',
    name: 'Herbal Hair Oil',
    price: 299,
    image: 'https://via.placeholder.com/300x300?text=Hair+Oil',
    rating: 4.5,
    reviews: 120,
    badge: 'Bestseller',
    originalPrice: 350
  },
  {
    id: '2',
    name: 'Ayurvedic Skin Cream',
    price: 399,
    image: 'https://via.placeholder.com/300x300?text=Skin+Cream',
    rating: 4.2,
    reviews: 85,
    badge: 'New',
    originalPrice: null
  },
  {
    id: '3',
    name: 'Herbal Supplements',
    price: 499,
    image: 'https://via.placeholder.com/300x300?text=Supplements',
    rating: 4.8,
    reviews: 210,
    badge: 'Sale',
    originalPrice: 599
  }
];

const FeaturedProducts = () => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [loading, setLoading] = useState(true);
  const loadingProgress = useLoadingProgress(LOADING_CONFIGS.FEATURED, false);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  // Fetch user type from local storage
  useEffect(() => {
    const fetchUserType = async () => {
      try {
        // Get user from local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Fetch user type from API using user ID
          const response = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userData.id}`);
          if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.attributes) {
              setUserType(result.data.attributes.userType || 'customer');
            }
          }
        } else {
          setUserType('customer'); // Default user type
        }
      } catch (error) {
        
        setUserType('customer'); // Default to customer on error
      }
    };
    
    fetchUserType();
  }, []);

  useEffect(() => {
    // Skip loading products if userType is not set yet
    if (userType === null) return;
    
    const loadProducts = async () => {
      try {
        setLoading(true);
        loadingProgress.startLoading();
        loadingProgress.setCurrentItem('Connecting to server...');
        
        // Fetch products with type=featured
        const response = await fetch('https://api.dharaniherbbals.com/api/product-masters?type=featured&pagination[limit]=-1');
        
        if (!response.ok) {
          loadingProgress.addError(`API responded with status: ${response.status}`);
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        loadingProgress.setManualStep(2, 40);
        loadingProgress.setCurrentItem('Processing product data...');
        
        const data = await response.json();
        
        
        let productList = [];
        if (Array.isArray(data)) {
          productList = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          productList = data.data;
        }
        
        if (productList.length === 0) {
          loadingProgress.addWarning('No featured products found, using fallback products');
          loadingProgress.setTotalItems(fallbackProducts.length);
          setProducts(fallbackProducts);
        } else {
          loadingProgress.setTotalItems(productList.length);
          loadingProgress.setManualStep(3, 70);
          loadingProgress.setCurrentItem('Formatting product data...');
          
          const formattedProducts = productList.map((item, index) => {
            const attributes = item.attributes || item;
            loadingProgress.setCurrentItem(`Processing ${attributes.Name || attributes.name || 'Product'}`);
            loadingProgress.incrementLoaded();
            
            return {
              id: item.id || Math.random().toString(),
              name: attributes.Name || attributes.name || 'Product',
              tamilName: attributes.tamil || null,
              price: getPriceByUserType(attributes, userType),
              image: attributes.photo || attributes.image || 'https://via.placeholder.com/300x300?text=Product',
              badge: attributes.type === 'featured' ? 'Featured' : null,
              originalPrice: attributes.originalPrice || null,
              skuId: attributes.skuid || attributes.SKUID || item.id?.toString()
            };
          });
          
          setProducts(formattedProducts);
          
          // Fetch review stats for all products
          loadingProgress.setCurrentItem('Loading product reviews...');
          const productIds = formattedProducts.map(p => parseInt(p.id)).filter(id => !isNaN(id));
          if (productIds.length > 0) {
            try {
              const stats = await getBulkProductReviewStats(productIds);
              setReviewStats(stats);
              loadingProgress.addLog(`Loaded reviews for ${Object.keys(stats).length} products`);
            } catch (reviewError) {
              loadingProgress.addWarning('Failed to load product reviews');
            }
          }
        }
      } catch (err) {
        loadingProgress.addError(`Failed to load products: ${err.message}`);
        setError('Failed to load products. Using sample products instead.');
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
        loadingProgress.stopLoading();
      }
    };

    loadProducts();
  }, [userType]);

  const handleWishlistToggle = (product) => {
    const productData = {
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    };

    if (isInWishlist(productData.id)) {
      removeFromWishlist(productData.id);
    } else {
      addToWishlist(productData);
    }
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    });
  };



  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked selection of the best products with amazing deals
            </p>
          </div>
          <RealTimeLoadingStatus 
            message="Loading Featured Products" 
            stage={loadingProgress.stage}
            progress={loadingProgress.progress}
            loadedItems={loadingProgress.stats.loadedItems}
            totalItems={loadingProgress.stats.totalItems}
            currentItem={loadingProgress.stats.currentItem}
            errors={loadingProgress.stats.errors}
            warnings={loadingProgress.stats.warnings}
            logs={loadingProgress.stats.logs}
            estimatedTimeRemaining={loadingProgress.stats.estimatedTimeRemaining}
            showLogs={true}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of the best products with amazing deals
          </p>
          {error && <p className="text-amber-500 mt-2 text-sm">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden">
                <img 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=Product';
                  }}
                />
                {product.badge && (
                  <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full ${
                    product.badge === 'Sale' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {product.badge}
                  </span>
                )}
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleWishlistToggle(product)}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
              
              <CardContent className="p-6">
                <h3 className={`font-semibold text-sm mb-2 group-hover:text-primary transition-colors ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil && product.tamilName ? filterPriceFromName(product.tamilName) : filterPriceFromName(product.name)}
                </h3>
                
                <div className="flex items-center mb-3">
                  <StarRating 
                    rating={reviewStats[product.id]?.average || 0} 
                    count={reviewStats[product.id]?.count || 0} 
                    size="sm" 
                    showCount={true} 
                  />
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
                
                <Button 
                  className="w-full group/btn"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
                  <span className={`text-sm ${isTamil ? 'tamil-text' : ''}`}>Add to Cart</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/products">
            <Button variant="outline" size="lg">
              <span className={isTamil ? 'tamil-text' : ''}>View All Products</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;