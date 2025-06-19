
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart, TrendingUp } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { getProducts } from '@/services/products';
import { Product, StrapiData } from '@/types/strapi';
import { getStrapiMedia } from '@/services/api';
import { formatPrice } from '@/lib/utils';

const TrendingProducts = () => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<StrapiData<Product>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await getProducts(1, 4, { trending: true });
        console.log('Trending products:', response);
        
        let productList = [];
        if (Array.isArray(response)) {
          productList = response;
        } else if (response.data && Array.isArray(response.data)) {
          productList = response.data;
        } else if (response.products && Array.isArray(response.products)) {
          productList = response.products;
        }
        
        const formattedProducts = productList.map(item => ({
          id: item.id,
          name: item.title || item.name || 'Product',
          price: parseFloat(item.price) || 0,
          image: item.image_base64 || item.image || '/placeholder.svg',
          rating: item.rating || 0,
          reviews: item.reviews || 0,
          badge: item.badge || null,
          originalPrice: item.originalPrice || null
        }));
        
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Failed to fetch trending products', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleWishlistToggle = (product: any) => {
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

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    });
  };

  const renderStars = (rating: number = 0) => {
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
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                
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
                
                <Button className="w-full group/btn" onClick={() => handleAddToCart(product)}>
                  <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Trending Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
