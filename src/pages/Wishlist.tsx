import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlistContext } from '@/contexts/WishlistContext';
import { useWishlistProducts } from '@/hooks/useWishlistProducts';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

const Wishlist = () => {
  const { wishlistProductIds, removeFromWishlist, wishlistCount } = useWishlistContext();
  const { products, loading } = useWishlistProducts(wishlistProductIds);
  const { addToCart } = useCart();
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  const handleAddToCart = (item: any) => {
    const productId = item.id.toString();
    addToCart(productId, productId, 1);
  };

  if (wishlistCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
        <SEOHead 
          title="My Wishlist"
          description="Your saved favorite products. Easily manage and shop from your wishlist of herbal and natural products."
          url="/wishlist"
        />
        <Header />
        <main className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-pink-100 to-red-100 rounded-full mb-8">
              <Heart className="w-12 h-12 text-pink-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
              Your Wishlist is Empty
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Save your favorite items to your wishlist and never lose track of them
            </p>
            <Link to="/products">
              <Button size="lg" className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 shadow-lg px-8 py-3">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Discover Products
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      <SEOHead 
        title="My Wishlist"
        description="Your saved favorite products. Easily manage and shop from your wishlist of herbal and natural products."
        url="/wishlist"
      />
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
              My Wishlist
            </h1>
            <p className="text-gray-600 text-lg">
              {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          
          {/* Wishlist Items */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading wishlist...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((item) => (
              <Card key={`${item.id}-${item.originalProductId}`} className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 shadow-lg hover:-translate-y-2">
                <div className="relative overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-64 object-contain bg-white group-hover:scale-105 transition-transform duration-500 p-4"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=Product';
                    }}
                  />
                  
                  {/* Wishlist Badge */}
                  <div className="absolute top-3 right-3">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="rounded-full shadow-lg bg-white/90 hover:bg-white"
                      onClick={() => removeFromWishlist(item.originalProductId || item.id.toString())}
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-6 bg-gradient-to-b from-white to-gray-50">
                  <Link to={`/product/${item.id}`}>
                    <h3 className={`font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 cursor-pointer uppercase ${isTamil ? 'tamil-text' : ''}`}>
                      {isTamil && item.tamil ? item.tamil : item.name}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-gray-500 mb-3">{item.category}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary">
                      {item.priceRange ? `₹${item.priceRange}` : item.price > 0 ? formatPrice(item.price) : 'View Product'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg" 
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      <span className={isTamil ? 'tamil-text' : ''}>Add to Cart</span>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeFromWishlist(item.originalProductId || item.id.toString())}
                      className="px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
          
          {/* Continue Shopping */}
          <div className="text-center mt-12">
            <Link to="/products">
              <Button variant="outline" size="lg" className="border-2 border-pink-300 hover:bg-pink-50 px-8 py-3">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;