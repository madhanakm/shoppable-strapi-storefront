
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Flame, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import { useWishlistContext } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useQuickCheckout } from '@/hooks/useQuickCheckout';
import StarRating from './StarRating';
import { filterPriceFromName } from '@/lib/productUtils';
import ProductSectionSkeleton from './ProductSectionSkeleton';
import { useBestSellingProducts } from '@/hooks/useProductQueries';
import { useUserType } from '@/hooks/useUserTypeQuery';

const HotSellingProducts = () => {
  const { data: userType = 'customer' } = useUserType();
  const { data: { products = [], reviewStats = {} } = {}, isLoading: loading } = useBestSellingProducts(userType, 12);
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();

  if (loading) {
    return (
      <ProductSectionSkeleton 
        title="Hot Selling Products"
        icon="flame"
        gradient="bg-gradient-to-br from-red-50 via-white to-orange-50"
        count={12}
      />
    );
  }

  if (products.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" style={{backgroundColor: '#f97316'}}></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" style={{backgroundColor: '#ea580c'}}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg animate-pulse" style={{background: 'linear-gradient(to right, #f97316, #ea580c)'}}>
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-3 ${isTamil ? 'tamil-text' : ''}`}>
            <span className="bg-clip-text text-transparent" style={{backgroundImage: 'linear-gradient(to right, #dc2626, #ea580c, #f97316)'}}>
              {isTamil ? 'சூடான விற்பனை தயாரிப்புகள்' : 'Hot Selling Products'}
            </span>
          </h2>
          <p className={`text-gray-600 text-lg max-w-2xl mx-auto ${isTamil ? 'tamil-text' : ''}`}>
            {isTamil ? 'সবচেয়ে বেশি চাহিদাসম্পন্ন পণ্য' : 'Top trending items everyone loves'}
          </p>
        </div>

        {/* Products Grid - 6 columns, 2 rows = 12 products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {products.map((product) => (
            <Card 
              key={product.id}
              className="group bg-white hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-orange-200 relative"
            >
              {/* Hot Badge */}
              <div className="absolute top-2 right-2 z-10 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1" style={{background: 'linear-gradient(to right, #f97316, #ea580c)'}}>
                <Flame className="w-3 h-3" />
                <span className="hidden sm:inline">{isTamil ? 'சூடان' : 'Hot'}</span>
              </div>

              {/* Product Image */}
              <div className="aspect-square overflow-hidden bg-gray-100 relative">
                <Link to={`/product/${product.id}`} className="block w-full h-full relative z-0">
                  <img
                    src={product.image || 'https://via.placeholder.com/300x300?text=Hot'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Hot';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </Link>
                
                {/* Wishlist Button */}
                <Button 
                  size="sm" 
                  className="absolute top-1 left-1 z-20 opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-lg bg-white/95 hover:bg-white border border-gray-100 hover:border-red-200 p-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const productId = product.id.toString();
                    isInWishlist(productId) ? removeFromWishlist(productId) : addToWishlist(productId);
                  }}
                >
                  <Heart className={`w-3 h-3 ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </Button>
              </div>

              {/* Product Info */}
              <CardContent className="p-2 sm:p-3">
                <Link to={`/product/${product.id}`}>
                  <h3 className={`font-semibold text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors text-xs md:text-sm ${isTamil ? 'tamil-text' : ''}`}>
                    {isTamil && product.tamil ? filterPriceFromName(product.tamil) : filterPriceFromName(product.name)}
                  </h3>
                </Link>
                
                <StarRating 
                  rating={reviewStats?.[product.id]?.average || 0} 
                  count={reviewStats?.[product.id]?.count || 0} 
                  size="sm" 
                  showCount={false} 
                />
                
                <div className="my-1">
                  <p className="text-sm md:text-base font-bold" style={{color: '#dc2626'}}>
                    {product.priceRange || formatPrice(product.displayPrice)}
                  </p>
                </div>

                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (product.isVariableProduct && product.variations) {
                      try {
                        const variations = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
                        if (variations && variations.length > 0) {
                          const firstVariation = variations[0];
                          const skuid = firstVariation.skuid || `${product.id}-${firstVariation.value || firstVariation.attributeValue}`;
                          addToCart(skuid, product.id.toString(), 1, product.name, product.price);
                          return;
                        }
                      } catch (e) {
                        // Handle error silently
                      }
                    }
                    
                    const skuid = product.skuid || product.id.toString();
                    addToCart(skuid, product.id.toString(), 1, product.name, product.price);
                  }}
                  className="w-full text-white shadow-sm hover:shadow-md transition-all duration-300 rounded py-1 text-[10px] font-medium min-h-[24px]"
                  style={{background: 'linear-gradient(to right, #f97316, #ea580c)'}}
                >
                  <ShoppingCart className="w-2.5 h-2.5 mr-0.5 flex-shrink-0 md:w-3 md:h-3" />
                  <span className="hidden sm:inline text-[10px]">{isTamil ? 'சேர்' : 'Add'}</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotSellingProducts;
