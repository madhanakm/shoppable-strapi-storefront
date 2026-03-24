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
    <section className="mt-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-xl animate-bounce">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent ${isTamil ? 'tamil-text' : ''}`}>
              {isTamil ? 'நீங்கள் விரும்பக்கூடியவை' : 'You May Also Like'}
            </h2>
          </div>
          <p className={`text-lg text-gray-600 max-w-2xl mx-auto ${isTamil ? 'tamil-text' : ''}`}>
            {isTamil ? 'உங்கள் கூடையில் சேர்க்க இந்த அற்புதமான தயாரிப்புகளையும் பாருங்கள்' : 'Complete your wellness journey with these amazing products'}
          </p>
          <div className="flex justify-center items-center gap-2 mt-4">
            <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <div className="w-20 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
            <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => {
            const price = getProductPrice(product);
            const isRange = typeof price === 'object' && price.minPrice !== undefined;

            return (
              <Card 
                key={product.id} 
                className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-transparent hover:border-blue-200 bg-white rounded-3xl hover:-translate-y-3 hover:rotate-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Product Image */}
                <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-blue-50 via-white to-purple-50">
                  <Link to={`/product/${product.id}`} className="block cursor-pointer">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Product';
                      }}
                    />
                  </Link>
                  
                  {/* Floating Badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                    ✨ New
                  </div>
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                
                <CardContent className="p-4 bg-white">
                  <Link to={`/product/${product.id}`}>
                    <h3 className={`font-bold text-sm mb-3 line-clamp-2 hover:text-blue-600 transition-colors uppercase leading-tight min-h-[2.5rem] ${isTamil ? 'tamil-text' : ''}`}>
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="mb-4">
                    <p className="text-lg font-black text-blue-600">
                      {isRange ? `${formatPrice(price.minPrice)} - ${formatPrice(price.maxPrice)}` : formatPrice(price)}
                    </p>
                  </div>
                  
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-2 font-semibold transform hover:scale-105"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    <span className={isTamil ? 'tamil-text' : ''}>
                      {isTamil ? 'கூடையில் சேர்' : 'Add to Cart'}
                    </span>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Link to="/products">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all px-8 py-4 text-lg font-bold rounded-2xl transform hover:scale-105"
            >
              <span className={isTamil ? 'tamil-text' : ''}>
                {isTamil ? 'மேலும் தயாரிப்புகள் பார்க்க' : 'Explore More Products'}
              </span>
              <ShoppingCart className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
