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
      const token = import.meta.env.VITE_STRAPI_API_TOKEN;
      const fields = 'fields[0]=Name&fields[1]=skuid&fields[2]=customerprice&fields[3]=price&fields[4]=isVariableProduct&fields[5]=variations&fields[6]=tamil&fields[7]=category';
      const response = await fetch(
        `https://api.dharaniherbbals.com/api/product-masters?pagination[pageSize]=12&filters[status][$eq]=true&${fields}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const cartSkuIds = cartItems.map(item => item.id);

        const formattedProducts = data.data
          .filter((item: any) => !cartSkuIds.includes(item.attributes?.skuid))
          .sort(() => Math.random() - 0.5)
          .slice(0, 4)
          .map((item: any) => {
            const attrs = item.attributes;
            let variationsData = [];
            if (attrs.variations) {
              try { variationsData = typeof attrs.variations === 'string' ? JSON.parse(attrs.variations) : attrs.variations; } catch {}
            }
            return {
              id: item.id,
              name: attrs.Name,
              price: parseFloat(attrs.customerprice || attrs.price || '0'),
              image: '',
              skuid: attrs.skuid || item.id?.toString(),
              isVariable: variationsData.length > 0,
              variations: variationsData
            };
          });

        setProducts(formattedProducts);

        // Lazy-load photos
        formattedProducts.forEach(async (p: Product) => {
          try {
            const r = await fetch(
              `https://api.dharaniherbbals.com/api/product-masters/${p.id}?fields[0]=photo`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (!r.ok) return;
            const d = await r.json();
            const photo = d.data?.attributes?.photo || '';
            setProducts(prev => prev.map(x => x.id === p.id ? { ...x, image: photo } : x));
          } catch {}
        });
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
    <section className="mt-6 bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-2xl overflow-hidden">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <h2 className={`text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent ${isTamil ? 'tamil-text' : ''}`}>
            {isTamil ? 'நீங்கள் தவறவிட்டிரக்கலாம்' : 'Items You May Have Missed'}
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {products.map((product, index) => {
            const price = getProductPrice(product);
            const isRange = typeof price === 'object' && price.minPrice !== undefined;

            return (
              <Card 
                key={product.id} 
                className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-transparent hover:border-green-200 bg-white rounded-3xl hover:-translate-y-3 hover:rotate-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Product Image */}
                <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-green-50 via-white to-emerald-50">
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
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                
                <CardContent className="p-2 bg-white flex flex-col items-center">
                  <Link to={`/product/${product.id}`} className="w-full">
                    <h3 className={`font-bold text-xs mb-2 line-clamp-2 hover:text-green-600 transition-colors uppercase leading-tight min-h-[1.5rem] text-center ${isTamil ? 'tamil-text' : ''}`}>
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="mb-2 w-full text-center">
                    <p className="text-sm font-black text-green-600">
                      {isRange ? `${formatPrice(price.minPrice)} - ${formatPrice(price.maxPrice)}` : formatPrice(price)}
                    </p>
                  </div>
                  
                  <Button
                    className="w-24 bg-gradient-to-r from-[#e6e6e6] to-[#f2f2f2] hover:from-[#f2f2f2] hover:to-[#e6e6e6] text-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-1 text-xs font-semibold transform hover:scale-105"
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

        {/* View More Button */}
        <div className="text-center mt-4">
          <Link to="/products">
            <Button size="sm" className="bg-gradient-to-r from-[#009108] to-[#55bf57] text-white shadow px-6 py-2 rounded-xl font-semibold">
              <span className={isTamil ? 'tamil-text' : ''}>
                {isTamil ? 'மேலும் தயாரிப்புகள் பார்க்க' : 'Explore More'}
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
