import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Zap, Heart, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import { useWishlistContext } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useQuickCheckout } from '@/hooks/useQuickCheckout';
import StarRating from './StarRating';
import { filterPriceFromName } from '@/lib/productUtils';
import ProductSectionSkeleton from './ProductSectionSkeleton';
import { useNewLaunchProducts } from '@/hooks/useProductQueries';
import { useUserType } from '@/hooks/useUserTypeQuery';

const DealsOfTheDay = () => {
  const { data: userType = 'customer' } = useUserType();
  const { data: { products = [], reviewStats = {} } = {}, isLoading: loading } = useNewLaunchProducts(userType as string, 8);
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();

  if (loading) {
    return (
      <ProductSectionSkeleton 
        title="Deals of the Day"
        icon="flame"
        gradient="bg-gradient-to-br from-orange-50 via-white to-yellow-50"
        count={8}
      />
    );
  }

  if (products.length === 0 && !loading) {
    return null;
  }

  // Calculate discount percentage (mock - you can implement actual discount logic)
  const getDiscount = (index: number) => Math.floor(Math.random() * 30) + 5;

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full filter blur-3xl opacity-20 translate-x-1/3 -translate-y-1/2" style={{backgroundColor: '#fb923c'}}></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full filter blur-3xl opacity-15 -translate-x-1/3 translate-y-1/2" style={{backgroundColor: '#f59e0b'}}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg animate-pulse" style={{background: 'linear-gradient(to right, #fb923c, #f59e0b)'}}>
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-3 ${isTamil ? 'tamil-text' : ''}`}>
            <span className="bg-clip-text text-transparent" style={{backgroundImage: 'linear-gradient(to right, #d97706, #f59e0b, #fb923c)'}}>
              {isTamil ? 'இன்றைய ஒப்பந்தங்கள்' : 'Deals of the Day'}
            </span>
          </h2>
          <p className={`text-gray-600 text-lg max-w-2xl mx-auto ${isTamil ? 'tamil-text' : ''}`}>
            {isTamil ? 'সীমিত সময়ের জন্য বিশাল ছাড়' : 'Exclusive products with amazing discounts'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <AlertCircle className="w-5 h-5" style={{color: '#d97706'}} />
            <span className="text-sm font-semibold uppercase tracking-wide" style={{color: '#d97706'}}>
              {isTamil ? 'সীমিত সময়' : 'Limited Time'}
            </span>
          </div>
        </div>

        {/* Products Grid - 4 columns, 2 rows = 8 products */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {products.map((product, index) => (
            <Card 
              key={product.id}
              className="group bg-white hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-orange-200 relative"
            >
              {/* Deal Badge with Discount */}
              <div className="absolute top-2 right-2 z-10 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex flex-col items-center gap-0.5" style={{background: 'linear-gradient(to right, #dc2626, #b91c1c)'}}>
                <span className="text-lg leading-none">-{getDiscount(index)}%</span>
                <span className="text-[10px]">{isTamil ? 'ছাড়' : 'Deal'}</span>
              </div>

              {/* Limited Quantity Badge */}
              <div className="absolute top-12 right-2 z-10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md bg-blue-500/90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                {isTamil ? 'சীমিত' : 'Limited'}
              </div>

              {/* Product Image */}
              <div className="aspect-square overflow-hidden bg-gray-100 relative">
                <Link to={`/product/${product.id}`} className="block w-full h-full relative z-0">
                  <img
                    src={product.image || 'https://via.placeholder.com/400x400?text=Deal'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Deal';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </Link>
                
                {/* Wishlist Button */}
                <Button 
                  size="sm" 
                  className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-lg bg-white/95 hover:bg-white border border-gray-100 hover:border-red-200 p-1.5"
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
              <CardContent className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className={`font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors uppercase text-xs md:text-sm ${isTamil ? 'tamil-text' : ''}`}>
                    {isTamil && product.tamil ? filterPriceFromName(product.tamil) : filterPriceFromName(product.name)}
                  </h3>
                </Link>
                
                <StarRating 
                  rating={reviewStats?.[product.id]?.average || 0} 
                  count={reviewStats?.[product.id]?.count || 0} 
                  size="sm" 
                  showCount={false} 
                />
                
                <div className="mb-3">
                  <p className="text-sm text-gray-500 line-through">
                    {formatPrice((product.displayPrice || 0) * 1.2)}
                  </p>
                  <p className="text-lg md:text-xl font-bold" style={{color: '#dc2626'}}>
                    {product.priceRange || formatPrice(product.displayPrice)}
                  </p>
                </div>

                <div className="flex gap-1 sm:gap-2">
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
                    className="flex-1 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-lg sm:rounded-xl py-1 text-[10px] font-medium min-h-[26px]"
                    style={{background: 'linear-gradient(to right, #f59e0b, #fb923c)'}}
                  >
                    <ShoppingCart className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" />
                    <span className="text-[10px] leading-none">{isTamil ? 'சேர்' : 'Add'}</span>
                  </Button>
                  
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/product/${product.id}`);
                    }}
                    className="flex-1 text-gray-800 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg sm:rounded-xl py-1 text-[10px] font-medium min-h-[26px]"
                    style={{background: 'linear-gradient(to right, #fef3c7, #fde68a)'}}
                  >
                    <span className="text-[10px] leading-none">{isTamil ? 'பார்' : 'View'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <Link to="/products">
            <Button 
              className="px-8 py-6 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
              style={{background: 'linear-gradient(to right, #dc2626, #b91c1c)'}}
            >
              {isTamil ? 'மேலும் ஒப்பந்தங்கள் பார்க்கவும்' : 'View More Deals'}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DealsOfTheDay;
