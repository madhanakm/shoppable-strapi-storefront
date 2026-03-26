import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, TrendingUp, Flame, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getPriceByUserType } from '@/lib/pricing';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import { useWishlistContext } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useQuickCheckout } from '@/contexts/QuickCheckoutContext';
import StarRating from './StarRating';
import { filterPriceFromName } from '@/lib/productUtils';
import { useBestSellingProducts } from '@/hooks/useProductData';
import ProductSectionSkeleton from './ProductSectionSkeleton';

const BestSellingProducts = () => {
  const { products, reviewStats, loading } = useBestSellingProducts();
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();

  if (loading) {
    return (
      <ProductSectionSkeleton 
        title="Best Selling Products"
        icon="flame"
        gradient="bg-gradient-to-br from-green-50 via-white to-emerald-50"
        count={10}
      />
    );
  }

  if (products.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" style={{backgroundColor: '#8ac440'}}></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" style={{backgroundColor: '#4ab748'}}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg animate-bounce" style={{background: 'linear-gradient(to right, #8ac440, #4ab748)'}}>
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-3 ${isTamil ? 'tamil-text' : ''}`}>
            <span className="bg-clip-text text-transparent" style={{backgroundImage: 'linear-gradient(to right, #0a7f06, #4ab748, #8ac440)'}}>
              {isTamil ? 'சிறந்த விற்பனையான தயாரிப்புகள்' : 'Best Selling Products'}
            </span>
          </h2>
          <p className={`text-gray-600 text-lg max-w-2xl mx-auto ${isTamil ? 'tamil-text' : ''}`}>
            {isTamil ? 'வாடிக்கையாளர்களால் மிகவும் விரும்பப்படும் தயாரிப்புகள்' : 'Most loved by our customers'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <TrendingUp className="w-5 h-5" style={{color: '#0a7f06'}} />
            <span className="text-sm font-semibold uppercase tracking-wide" style={{color: '#0a7f06'}}>
              {isTamil ? 'டிரெண்டிங் இப்போது' : 'Trending Now'}
            </span>
          </div>
        </div>

        {/* Products Grid - 5 columns, 2 rows = 10 products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {products.map((product) => (
            <Card 
              key={product.id}
              className="group bg-white hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-orange-200 relative"
            >
              {/* Best Seller Badge */}
              <div className="absolute top-2 right-2 z-10 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1" style={{background: 'linear-gradient(to right, #8ac440, #4ab748)'}}>
                <Flame className="w-3 h-3" />
                <span>{isTamil ? 'சிறந்தது' : 'Best'}</span>
              </div>

              {/* Product Image */}
              <div className="aspect-square overflow-hidden bg-gray-100 relative">
                <Link to={`/product/${product.id}`} className="block w-full h-full relative z-0">
                  <img
                    src={product.image || 'https://via.placeholder.com/400x400?text=Product'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Product';
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
                  <p className="text-xl md:text-2xl font-bold" style={{color: '#0a7f06'}}>
                    {product.priceRange || formatPrice(product.price)}
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
                    className={`flex-1 text-gray-800 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg sm:rounded-xl py-1 sm:py-1.5 text-[9px] sm:text-xs font-medium min-h-[22px] sm:min-h-[28px] ${isTamil ? 'tamil-text text-[8px] sm:text-[9px]' : ''}`}
                    style={{background: 'linear-gradient(to right, #e6e6e6, #f2f2f2)'}}
                  >
                    <ShoppingCart className="w-2 sm:w-3 h-2 sm:h-3 mr-0.5 sm:mr-1" />
                    <span className={`${isTamil ? 'tamil-text text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-xs'}`}>
                      {isTamil ? 'கூடையில் சேர்' : 'Add'}
                    </span>
                  </Button>
                  
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
                            const variationName = firstVariation.value || firstVariation.attributeValue || Object.values(firstVariation)[0];
                            
                            setQuickCheckoutItem({
                              id: product.id.toString(),
                              skuid: skuid,
                              name: `${product.name} - ${variationName}`,
                              tamil: product.tamil ? `${product.tamil} - ${variationName}` : null,
                              price: getPriceByUserType(firstVariation, product.userType || 'customer'),
                              image: product.image,
                              category: product.category,
                              variation: variationName,
                              quantity: 1
                            });
                            navigate('/checkout');
                            return;
                          }
                        } catch (e) {
                          // Handle error silently
                        }
                      }
                      
                      const skuid = product.skuid || product.id.toString();
                      setQuickCheckoutItem({
                        id: product.id.toString(),
                        skuid: skuid,
                        name: product.name,
                        tamil: product.tamil || null,
                        price: product.price,
                        image: product.image,
                        category: product.category,
                        quantity: 1
                      });
                      navigate('/checkout');
                    }}
                    className={`flex-1 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-lg sm:rounded-xl py-1 sm:py-1.5 text-[9px] sm:text-xs font-medium min-h-[22px] sm:min-h-[28px] ${isTamil ? 'tamil-text text-[8px] sm:text-[9px]' : ''}`}
                    style={{background: 'linear-gradient(to right, #009108, #55bf57)'}}
                  >
                    <span className={`${isTamil ? 'tamil-text text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-xs'}`}>
                      {isTamil ? 'வாங்கு' : 'Buy'}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/products?type=Best Selling">
            <Button 
              size="lg"
              className="text-white shadow-xl hover:shadow-2xl transition-all px-8 py-6 text-lg"
              style={{background: 'linear-gradient(to right, #0a7f06, #4ab748)'}}
            >
              <span className={isTamil ? 'tamil-text' : ''}>
                {isTamil ? 'அனைத்து தயாரிப்புகளையும் பார்க்க' : 'View All Products'}
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellingProducts;
