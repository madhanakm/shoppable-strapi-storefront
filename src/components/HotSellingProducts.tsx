
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart, Flame } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';

const HotSellingProducts = () => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const products = [
    {
      id: '11',
      name: 'Premium Leather Wallet',
      price: 39.99,
      originalPrice: 55.99,
      rating: 4.9,
      reviews: 345,
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=300&h=300&fit=crop',
      badge: 'Best Seller',
      category: 'Fashion'
    },
    {
      id: '12',
      name: 'Wireless Charging Pad',
      price: 29.99,
      rating: 4.6,
      reviews: 278,
      image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&h=300&fit=crop',
      badge: 'Hot Sale',
      category: 'Electronics'
    },
    {
      id: '13',
      name: 'Artisan Coffee Beans',
      price: 19.99,
      rating: 4.8,
      reviews: 189,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop',
      category: 'Food'
    },
    {
      id: '14',
      name: 'Bamboo Phone Stand',
      price: 15.99,
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=300&h=300&fit=crop',
      category: 'Home'
    }
  ];

  const handleWishlistToggle = (product: any) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const renderStars = (rating: number) => {
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

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl font-bold">Hot Selling Products</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our best-selling items that customers can't get enough of
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.badge && (
                  <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full ${
                    product.badge === 'Best Seller' ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'
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
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
              
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                
                <div className="flex items-center space-x-1 mb-3">
                  {renderStars(product.rating)}
                  <span className="text-sm text-muted-foreground ml-2">({product.reviews})</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">${product.originalPrice}</span>
                    )}
                  </div>
                </div>
                
                <Button className="w-full group/btn">
                  <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Hot Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HotSellingProducts;
