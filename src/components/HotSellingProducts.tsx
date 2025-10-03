
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart, Flame } from 'lucide-react';
import { useWishlistContext } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { getProducts } from '@/services/products';
import { Product, StrapiData } from '@/types/strapi';
import { getStrapiMedia } from '@/services/api';
import { formatPrice } from '@/lib/utils';
import { getPriceByUserType } from '@/lib/pricing';
import { getBulkProductReviewStats } from '@/services/reviews';
import StarRating from './StarRating';
import { LoadingWithStatus } from './ProductSkeleton';

const HotSellingProducts = () => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<StrapiData<Product>[]>([]);
  const [reviewStats, setReviewStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

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
        const response = await getProducts(1, 12, { hot_selling: true });
        
        
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
          price: getPriceByUserType(item, userType),
          image: item.image_base64 || item.image || '/placeholder.svg',
          badge: item.badge || null,
          originalPrice: item.originalPrice || null,
          skuId: item.skuid || item.SKUID || item.id?.toString()
        }));
        
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
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [userType]);

  const handleWishlistToggle = (product: any) => {
    const skuid = product.skuId || product.id.toString();

    if (isInWishlist(skuid)) {
      removeFromWishlist(skuid);
    } else {
      addToWishlist(skuid);
    }
  };

  const handleAddToCart = (product: any) => {
    const skuid = product.skuId || product.id.toString();
    addToCart(skuid, product.id.toString(), 1);
  };



  if (loading) {
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
          <LoadingWithStatus 
            message="Loading Hot Selling Products" 
            stage="Finding bestsellers"
            showProgress={true}
            progress={75}
            showSteps={true}
            currentStep={3}
          />
        </div>
      </section>
    );
  }

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <Heart className={`w-4 h-4 ${isInWishlist(product.skuId || product.id.toString()) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
              
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors uppercase">{product.name}</h3>
                
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
