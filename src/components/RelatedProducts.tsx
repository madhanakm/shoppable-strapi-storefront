import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { getPriceByUserType, getVariablePriceRange } from '@/lib/pricing';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  skuid: string;
  isVariable?: boolean;
  variations?: any[];
}

const RelatedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartItems } = useCart();
  const { user } = useAuth();
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  useEffect(() => {
    fetchRelatedProducts();
  }, []);

  const fetchRelatedProducts = async () => {
    try {
      const timestamp = new Date().getTime();
      
      // Get cart product IDs to exclude (using id field which is skuid)
      const cartSkuIds = cartItems.map(item => item.id);
      
      // Fetch random products
      const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?pagination[pageSize]=20&populate=variations&timestamp=${timestamp}`);
      
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const formattedProducts = data.data.map((item: any) => {
          const attrs = item.attributes;
          
          let variationsData = [];
          if (attrs.variations) {
            if (typeof attrs.variations === 'string') {
              try {
                variationsData = JSON.parse(attrs.variations);
              } catch (e) {
                console.error('Failed to parse variations:', e);
              }
            } else if (Array.isArray(attrs.variations)) {
              variationsData = attrs.variations;
            } else if (attrs.variations.data) {
              variationsData = attrs.variations.data;
            }
          }
          
          const isVariable = variationsData.length > 0;
          
          return {
            id: item.id,
            name: attrs.Name,
            price: parseFloat(attrs.customerprice || attrs.price || '0'),
            image: attrs.photo,
            skuid: attrs.skuid || attrs.SKUID || item.id?.toString(),
            isVariable,
            variations: variationsData
          };
        });
        
        // Filter out products that are already in cart (by skuid)
        const filteredProducts = formattedProducts.filter(
          product => !cartSkuIds.includes(product.skuid)
        );
        
        // Shuffle and take 8 products
        const shuffled = filteredProducts.sort(() => Math.random() - 0.5);
        setProducts(shuffled.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductPrice = (product: Product) => {
    const userType = (user as any)?.userType?.toLowerCase() || 'customer';
    
    if (product.isVariable && product.variations && product.variations.length > 0) {
      const priceRange = getVariablePriceRange(product.variations, userType);
      if (priceRange && priceRange.minPrice > 0) {
        return priceRange;
      }
    }
    
    return product.price;
  };

  const handleAddToCart = (product: Product) => {
    // For variable products, use first variation's skuid
    let skuid = product.skuid;
    if (product.isVariable && product.variations && product.variations.length > 0) {
      skuid = product.variations[0].skuid || product.skuid;
    }
    
    // Cart format: {"productId":"skuid", "id":"product_id", "quantity":1}
    // addToCart(productId, skuid, quantity) where productId becomes id field
    addToCart(skuid, product.id.toString(), 1);
  };

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 bg-white p-8 rounded-lg shadow-lg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className={`text-2xl md:text-3xl font-bold text-gray-800 mb-2 ${isTamil ? 'tamil-text' : ''}`}>
            {isTamil ? 'தொடர்புடைய தயாரிப்புகள்' : 'You May Also Like'}
          </h2>
          <p className={`text-gray-600 ${isTamil ? 'tamil-text' : ''}`}>
            {isTamil ? 'இந்த தயாரிப்புகளையும் பாருங்கள்' : 'Check out these products'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
        {products.map((product) => {
          const price = getProductPrice(product);
          const isRange = typeof price === 'object' && price.minPrice !== undefined;

          return (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-3">
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square bg-white rounded-lg overflow-hidden mb-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150x150?text=Product';
                      }}
                    />
                  </div>
                </Link>
                
                <Link to={`/product/${product.id}`}>
                  <h3 className={`font-semibold text-xs mb-1 line-clamp-2 hover:text-primary transition-colors uppercase ${isTamil ? 'tamil-text' : ''}`}>
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-sm font-bold text-primary mb-2">
                  {isRange ? `${formatPrice(price.minPrice)} - ${formatPrice(price.maxPrice)}` : formatPrice(price)}
                </p>
                
                <Button
                  size="sm"
                  className="w-full text-xs py-1 h-7"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  <span className={isTamil ? 'tamil-text' : ''}>
                    {isTamil ? 'சேர்' : 'Add'}
                  </span>
                </Button>
              </CardContent>
            </Card>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;
