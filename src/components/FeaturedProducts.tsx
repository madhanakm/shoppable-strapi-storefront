import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { useTranslation, LANGUAGES } from './TranslationProvider';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // Fetch products with type=featured
        const response = await fetch('https://api.dharaniherbbals.com/api/product-masters?type=featured&limit=6');
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Featured products API response:', data);
        
        let productList = [];
        if (Array.isArray(data)) {
          productList = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          productList = data.data;
        }
        
        if (productList.length === 0) {
          console.log('No featured products found, using fallback data');
          setProducts(fallbackProducts);
        } else {
          const formattedProducts = productList.map(item => {
            const attributes = item.attributes || item;
            return {
              id: item.id || Math.random().toString(),
              name: attributes.Name || attributes.name || 'Product',
              price: parseFloat(attributes.mrp || attributes.price) || 0,
              image: attributes.photo || attributes.image || 'https://via.placeholder.com/300x300?text=Product',
              rating: attributes.rating || 4,
              reviews: attributes.reviews || 10,
              badge: attributes.type === 'featured' ? 'Featured' : null,
              originalPrice: attributes.originalPrice || null
            };
          });
          
          setProducts(formattedProducts);
        }
      } catch (err) {
        console.error('Failed to fetch featured products', err);
        setError('Failed to load products. Using sample products instead.');
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

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

  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <p>Loading featured products...</p>
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
                  {product.name}
                </h3>
                
                <div className="flex items-center space-x-1 mb-3">
                  {renderStars(product.rating)}
                  <span className="text-xs text-muted-foreground ml-2">
                    ({product.reviews || 0})
                  </span>
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