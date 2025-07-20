import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart, TrendingUp } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { getPriceByUserType } from '@/lib/pricing';
import { filterPriceFromName } from '@/lib/productUtils';
import { Link } from 'react-router-dom';
import { useTranslation, LANGUAGES } from './TranslationProvider';
import { getBulkProductReviewStats } from '@/services/reviews';
import StarRating from './StarRating';

// Fallback trending products
const fallbackProducts = [
  {
    id: '4',
    name: 'Herbal Face Wash',
    price: 199,
    image: 'https://via.placeholder.com/300x300?text=Face+Wash',
    rating: 4.3,
    reviews: 78,
    badge: 'Trending',
    originalPrice: 249
  },
  {
    id: '5',
    name: 'Ayurvedic Digestive Tablets',
    price: 349,
    image: 'https://via.placeholder.com/300x300?text=Tablets',
    rating: 4.7,
    reviews: 156,
    badge: 'Bestseller',
    originalPrice: null
  },
  {
    id: '6',
    name: 'Natural Shampoo',
    price: 249,
    image: 'https://via.placeholder.com/300x300?text=Shampoo',
    rating: 4.4,
    reviews: 92,
    badge: 'Trending',
    originalPrice: 299
  },
  {
    id: '7',
    name: 'Herbal Toothpaste',
    price: 99,
    image: 'https://via.placeholder.com/300x300?text=Toothpaste',
    rating: 4.2,
    reviews: 64,
    badge: 'New',
    originalPrice: null
  }
];

const TrendingProducts = () => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [loading, setLoading] = useState(true);
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
        // Direct API call using type=trending
        const response = await fetch('https://api.dharaniherbbals.com/api/product-masters?type=trending&pagination[limit]=-1');
        
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
        
        if (productList.length === 0) {
          
          setProducts(fallbackProducts);
        } else {
          const formattedProducts = productList.map(item => {
            const attributes = item.attributes || item;
            return {
              id: item.id || Math.random().toString(),
              name: attributes.Name || attributes.name || 'Product',
              price: getPriceByUserType(attributes, userType),
              image: attributes.photo || attributes.image || 'https://via.placeholder.com/300x300?text=Product',
              badge: attributes.type === 'trending' ? 'Trending' : null,
              originalPrice: attributes.originalPrice || null,
              skuId: attributes.skuid || attributes.SKUID || item.id?.toString()
            };
          });
          
          setProducts(formattedProducts);
          
          // Fetch review stats for all products
          const productIds = formattedProducts.map(p => parseInt(p.id)).filter(id => !isNaN(id));
          if (productIds.length > 0) {
            try {
              const stats = await getBulkProductReviewStats(productIds);
              setReviewStats(stats);
            } catch (reviewError) {
              
            }
          }
        }
      } catch (err) {
        
        setError('Failed to load trending products. Using sample products instead.');
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
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
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p>Loading trending products...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">Trending Products</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover what's popular right now - products that are making waves in the market
          </p>
          {error && <p className="text-amber-500 mt-2 text-sm">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                    product.badge === 'Trending' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
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
                <h3 className={`font-semibold text-lg mb-2 group-hover:text-primary transition-colors ${isTamil ? 'tamil-text' : ''}`}>
                  {filterPriceFromName(product.name)}
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
                    <span className="text-2xl font-bold text-primary">{formatPrice(getPriceByUserType(product, userType))}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                </div>
                
                <Button className="w-full group/btn" onClick={() => handleAddToCart(product)}>
                  <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
                  <span className={isTamil ? 'tamil-text' : ''}>Add to Cart</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/products">
            <Button variant="outline" size="lg">
              <span className={isTamil ? 'tamil-text' : ''}>View All Trending Products</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;