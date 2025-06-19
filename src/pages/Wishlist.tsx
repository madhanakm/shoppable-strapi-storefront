
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (item: any) => {
    addToCart(item);
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  if (wishlistCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Your Wishlist</h1>
            <p className="text-muted-foreground mb-6 md:mb-8">Your wishlist is empty</p>
            <Link to="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Your Wishlist ({wishlistCount} items)</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {wishlistItems.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="absolute top-2 md:top-3 right-2 md:right-3 h-8 w-8 p-0"
                  onClick={() => removeFromWishlist(product.id)}
                >
                  <Heart className="w-3 h-3 md:w-4 md:h-4 fill-red-500 text-red-500" />
                </Button>
              </div>
              
              <CardContent className="p-4 md:p-6">
                <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-3">{product.category}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg md:text-2xl font-bold text-primary">${product.price}</span>
                </div>
                <Button 
                  className="w-full text-sm md:text-base"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
