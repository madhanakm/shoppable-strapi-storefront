import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { getFeaturedProducts } from '@/services/products';
import { Product, StrapiData } from '@/types/strapi';
import { getStrapiMedia } from '@/services/api';

const FeaturedProducts = () => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<StrapiData<Product>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await getFeaturedProducts(6);
        setProducts(response.data);
      } catch (err) {
        console.error('Failed to fetch featured products', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleWishlistToggle = (product: StrapiData<Product>) => {
    const productData = {
      id: product.id.toString(),
      name: product.attributes.name,
      price: product.attributes.price,
      image: getStrapiMedia(product.attributes.image?.data?.attributes?.url || ''),
      category: product.attributes.category
    };

    if (isInWishlist(productData.id)) {
      removeFromWishlist(productData.id);
    } else {
      addToWishlist(productData);
    }
  };

  const handleAddToCart = (product: StrapiData<Product>) => {
    addToCart({
      id: product.id.toString(),
      name: product.attributes.name,
      price: product.attributes.price,
      image: getStrapiMedia(product.attributes.image?.data?.attributes?.url || ''),
      category: product.attributes.category
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
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <p>Loading featured products...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">{error}</p>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden">
                <img 
                  src={getStrapiMedia(product.attributes.image?.data?.attributes?.url || '')}
                  alt={product.attributes.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.attributes.badge && (
                  <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full ${
                    product.attributes.badge === 'Sale' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {product.attributes.badge}
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
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {product.attributes.name}
                </h3>
                
                <div className="flex items-center space-x-1 mb-3">
                  {renderStars(product.attributes.rating)}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({product.attributes.reviews || 0})
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary">${product.attributes.price}</span>
                    {product.attributes.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        ${product.attributes.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
                
                <Button 
                  className="w-full group/btn"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/products">
            <Button variant="outline" size="lg">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;