import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart, TrendingUp, Flame, Zap, Tag } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useTranslation, LANGUAGES } from './TranslationProvider';

// Demo products as fallback
const demoProducts = {
  deals: [
    {
      id: '1',
      name: 'Herbal Hair Oil',
      price: 199,
      originalPrice: 299,
      image: 'https://via.placeholder.com/300x300?text=Hair+Oil',
      rating: 4.5,
      reviews: 120,
      badge: 'Deal'
    },
    {
      id: '2',
      name: 'Ayurvedic Skin Cream',
      price: 249,
      originalPrice: 399,
      image: 'https://via.placeholder.com/300x300?text=Skin+Cream',
      rating: 4.2,
      reviews: 85,
      badge: 'Deal'
    }
  ],
  trending: [
    {
      id: '3',
      name: 'Herbal Face Wash',
      price: 149,
      originalPrice: 199,
      image: 'https://via.placeholder.com/300x300?text=Face+Wash',
      rating: 4.3,
      reviews: 78,
      badge: 'Trending'
    },
    {
      id: '4',
      name: 'Ayurvedic Digestive Tablets',
      price: 299,
      originalPrice: 349,
      image: 'https://via.placeholder.com/300x300?text=Tablets',
      rating: 4.7,
      reviews: 156,
      badge: 'Trending'
    }
  ],
  hot: [
    {
      id: '5',
      name: 'Natural Shampoo',
      price: 199,
      originalPrice: 249,
      image: 'https://via.placeholder.com/300x300?text=Shampoo',
      rating: 4.4,
      reviews: 92,
      badge: 'Hot'
    },
    {
      id: '6',
      name: 'Herbal Toothpaste',
      price: 79,
      originalPrice: 99,
      image: 'https://via.placeholder.com/300x300?text=Toothpaste',
      rating: 4.2,
      reviews: 64,
      badge: 'Hot'
    }
  ],
  popular: [
    {
      id: '7',
      name: 'Ayurvedic Soap',
      price: 89,
      originalPrice: 119,
      image: 'https://via.placeholder.com/300x300?text=Soap',
      rating: 4.6,
      reviews: 210,
      badge: 'Popular'
    },
    {
      id: '8',
      name: 'Herbal Tea',
      price: 149,
      originalPrice: 199,
      image: 'https://via.placeholder.com/300x300?text=Tea',
      rating: 4.8,
      reviews: 175,
      badge: 'Popular'
    }
  ]
};

// Product Card Component
const ProductCard = ({ product }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  const handleWishlistToggle = () => {
    const productData = {
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.image
    };

    if (isInWishlist(productData.id)) {
      removeFromWishlist(productData.id);
    } else {
      addToWishlist(productData);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.image
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

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Deal': 
      case 'deals': return 'bg-purple-500';
      case 'Trending': 
      case 'trending': return 'bg-blue-500';
      case 'Hot': 
      case 'hot': return 'bg-red-500';
      case 'Popular': 
      case 'popular': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
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
          <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(product.badge)} text-white`}>
            {product.badge.charAt(0).toUpperCase() + product.badge.slice(1)}
          </span>
        )}
        <Button 
          size="sm" 
          variant="secondary" 
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleWishlistToggle}
        >
          <Heart className={`w-4 h-4 ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </div>
      
      <CardContent className="p-6">
        <h3 className={`font-semibold text-lg mb-2 group-hover:text-primary transition-colors ${isTamil ? 'tamil-text' : ''}`}>
          {product.name}
        </h3>
        
        <div className="flex items-center space-x-1 mb-3">
          {renderStars(product.rating)}
          <span className="text-sm text-muted-foreground ml-2">({product.reviews || 0})</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
        
        <Button className="w-full group/btn" onClick={handleAddToCart}>
          <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
          <span className={isTamil ? 'tamil-text' : ''}>Add to Cart</span>
        </Button>
      </CardContent>
    </Card>
  );
};

// Product Block Component
const ProductBlock = ({ type, title, description, icon, bgColor }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?type=${type}&limit=4`);
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`${type} products API response:`, data);
        
        let productList = [];
        if (Array.isArray(data)) {
          productList = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          productList = data.data;
        }
        
        if (productList.length === 0) {
          console.log(`No ${type} products found, using fallback data`);
          setProducts(demoProducts[type] || []);
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
              badge: attributes.type || type,
              originalPrice: attributes.originalPrice || null
            };
          });
          
          setProducts(formattedProducts);
        }
      } catch (err) {
        console.error(`Failed to fetch ${type} products`, err);
        setError(`Failed to load ${type} products. Using sample products instead.`);
        setProducts(demoProducts[type] || []);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type]);

  if (loading) {
    return (
      <section className={`py-16 ${bgColor}`}>
        <div className="container mx-auto px-4 text-center">
          <p>Loading {title}...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 ${bgColor}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            {icon}
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
          {error && <p className="text-amber-500 mt-2 text-sm">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to={`/products?type=${type}`}>
            <Button variant="outline" size="lg">
              <span className={isTamil ? 'tamil-text' : ''}>View All {title}</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Main Component with all Product Blocks
const ProductBlocks = () => {
  return (
    <>
      <ProductBlock 
        type="deals"
        title="Deals of the Day" 
        description="Limited time offers with amazing discounts on our best products"
        icon={<Tag className="w-8 h-8 text-purple-500" />}
        bgColor="bg-gradient-to-b from-background to-purple-50/30"
      />
      
      <ProductBlock 
        type="trending"
        title="Trending Products" 
        description="Discover what's popular right now - products that are making waves in the market"
        icon={<TrendingUp className="w-8 h-8 text-blue-500" />}
        bgColor="bg-gradient-to-b from-background to-blue-50/30"
      />
      
      <ProductBlock 
        type="hot"
        title="Hot Selling" 
        description="Our fastest selling products that customers can't get enough of"
        icon={<Flame className="w-8 h-8 text-red-500" />}
        bgColor="bg-gradient-to-b from-background to-red-50/30"
      />
      
      <ProductBlock 
        type="popular"
        title="Popular Choices" 
        description="Customer favorites with the highest ratings and most reviews"
        icon={<Zap className="w-8 h-8 text-green-500" />}
        bgColor="bg-gradient-to-b from-background to-green-50/30"
      />
    </>
  );
};

export default ProductBlocks;