
import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWishlist } from '@/contexts/WishlistContext';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3);
  const { wishlistCount } = useWishlist();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/">
              <h1 className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">ShopHub</h1>
            </Link>
          </div>

          {/* Search bar - Hidden on mobile */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 bg-muted/50 border-muted focus:bg-background transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* User account */}
            <Button variant="ghost" size="sm" className="hidden lg:flex items-center space-x-2 hover:bg-accent">
              <User className="h-4 w-4" />
              <span className="hidden xl:inline">Account</span>
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="sm" className="relative hover:bg-accent">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
              <span className="hidden xl:inline ml-2">Wishlist</span>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="sm" className="relative hover:bg-accent">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="hidden xl:inline ml-2">Cart</span>
            </Button>

            {/* Mobile menu toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden hover:bg-accent"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-8 py-3 border-t">
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors py-2">Electronics</a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors py-2">Fashion</a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors py-2">Home & Garden</a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors py-2">Sports</a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors py-2">Books</a>
          <a href="#" className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors py-2">Sale</a>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search products..." className="pl-10 bg-muted/50" />
            </div>
            
            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <a href="#" className="block py-3 text-sm font-medium hover:text-primary transition-colors border-b border-border/50">Electronics</a>
              <a href="#" className="block py-3 text-sm font-medium hover:text-primary transition-colors border-b border-border/50">Fashion</a>
              <a href="#" className="block py-3 text-sm font-medium hover:text-primary transition-colors border-b border-border/50">Home & Garden</a>
              <a href="#" className="block py-3 text-sm font-medium hover:text-primary transition-colors border-b border-border/50">Sports</a>
              <a href="#" className="block py-3 text-sm font-medium hover:text-primary transition-colors border-b border-border/50">Books</a>
              <a href="#" className="block py-3 text-sm font-medium text-red-600 hover:text-red-700 transition-colors border-b border-border/50">Sale</a>
            </nav>
            
            {/* Mobile Account Actions */}
            <div className="space-y-2 pt-4 border-t">
              <Button className="w-full justify-start" variant="outline">
                <User className="h-4 w-4 mr-2" />
                My Account
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist ({wishlistCount})
                </Button>
                <Button variant="outline" className="justify-start">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart ({cartCount})
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
