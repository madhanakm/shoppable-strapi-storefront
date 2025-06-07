
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart } from 'lucide-react';

const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      price: 79.99,
      originalPrice: 99.99,
      rating: 4.5,
      reviews: 128,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      badge: 'Sale'
    },
    {
      id: 2,
      name: 'Smart Fitness Watch',
      price: 199.99,
      rating: 4.8,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      badge: 'New'
    },
    {
      id: 3,
      name: 'Organic Cotton T-Shirt',
      price: 29.99,
      rating: 4.3,
      reviews: 45,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
    },
    {
      id: 4,
      name: 'Modern Table Lamp',
      price: 49.99,
      rating: 4.6,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop'
    },
    {
      id: 5,
      name: 'Yoga Mat Premium',
      price: 34.99,
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop'
    },
    {
      id: 6,
      name: 'Coffee Bean Grinder',
      price: 89.99,
      rating: 4.4,
      reviews: 93,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop'
    }
  ];

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
          <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of the best products with amazing deals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    product.badge === 'Sale' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {product.badge}
                  </span>
                )}
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="w-4 h-4" />
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
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
