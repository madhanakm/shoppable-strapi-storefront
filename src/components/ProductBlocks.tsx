import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart, TrendingUp, Flame, Zap, Tag, ArrowRight, Eye } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useTranslation, LANGUAGES } from './TranslationProvider';

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
    <Link to={`/product/${product.id}`} className="block">
      <Card className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 shadow-lg hover:-translate-y-2">
        <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-64 object-contain bg-white group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=Product';
          }}
        />
        
        {/* Discount Badge */}
        {getDiscountPercentage() > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-full">
            -{getDiscountPercentage()}%
          </span>
        )}
        
        {/* Type Badge */}
        {product.badge && (
          <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full ${getBadgeColor(product.badge)} text-white shadow-lg`}>
            {product.badge.charAt(0).toUpperCase() + product.badge.slice(1)}
          </span>
        )}
        
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              className="rounded-full shadow-lg"
              onClick={handleWishlistToggle}
            >
              <Heart className={`w-4 h-4 ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Link to={`/product/${product.id}`}>
              <Button size="sm" variant="secondary" className="rounded-full shadow-lg">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6 bg-gradient-to-b from-white to-gray-50">
        <h3 className={`font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 ${isTamil ? 'tamil-text' : ''}`}>
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            {renderStars(product.rating)}
            <span className="text-sm text-muted-foreground ml-1">({product.reviews || 0})</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
        
        <Button 
          className="w-full group/btn bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300" 
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
          <span className={isTamil ? 'tamil-text' : ''}>Add to Cart</span>
        </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

// Product Block Component
const ProductBlock = ({ type, title, description, icon, bgColor, accentColor }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters`);
        
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
        
        const filteredProducts = productList.filter(item => {
          const attributes = item.attributes || item;
          const status = attributes.status === true || attributes.status === 'true';
          return attributes.type?.toLowerCase() === type.toLowerCase() && status;
        });
        
        const formattedProducts = filteredProducts.map(item => {
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
        
        setProducts(formattedProducts.slice(0, 6));
      } catch (err) {
        console.error(`Failed to fetch ${type} products`, err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type]);

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
    <section className={`py-20 ${bgColor} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-current"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-current"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={`p-3 rounded-full ${accentColor} shadow-lg`}>
              {icon}
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/50 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to={`/products?type=${type}`}>
            <Button 
              size="lg" 
              variant="outline" 
              className="group border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              <span className={isTamil ? 'tamil-text' : ''}>View All {title}</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
        title="Deals of the Day" 
        description="Limited time offers with amazing discounts on our best herbal products. Don't miss out on these incredible savings!"
        icon={<Tag className="w-8 h-8 text-white" />}
        bgColor="bg-gradient-to-br from-purple-50 via-white to-purple-100"
        accentColor="bg-gradient-to-r from-purple-500 to-purple-600"
      />
      
      <ProductBlock 
        type="trending"
        title="Trending Products" 
        description="Discover what's popular right now - products that are making waves in the herbal wellness market"
        icon={<TrendingUp className="w-8 h-8 text-white" />}
        bgColor="bg-gradient-to-br from-blue-50 via-white to-blue-100"
        accentColor="bg-gradient-to-r from-blue-500 to-blue-600"
      />
      
      <ProductBlock 
        type="hot"
        title="Hot Selling" 
        description="Our fastest selling herbal products that customers can't get enough of. Join the trend!"
        icon={<Flame className="w-8 h-8 text-white" />}
        bgColor="bg-gradient-to-br from-red-50 via-white to-red-100"
        accentColor="bg-gradient-to-r from-red-500 to-red-600"
      />
      
      <ProductBlock 
        type="popular"
        title="Popular Choices" 
        description="Customer favorites with the highest ratings and most positive reviews. Trusted by thousands!"
        icon={<Zap className="w-8 h-8 text-white" />}
        bgColor="bg-gradient-to-br from-green-50 via-white to-green-100"
        accentColor="bg-gradient-to-r from-green-500 to-green-600"
      />
    </>
  );
};

export default ProductBlocks;