
import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">ShopHub</h1>
          </div>

          {/* Search bar - Hidden on mobile */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 bg-muted/50 border-muted"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* User account */}
            <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Account</span>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Mobile menu toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 py-2 border-t">
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Electronics</a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Fashion</a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Home & Garden</a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Sports</a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Books</a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Sale</a>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>
            <nav className="space-y-2">
              <a href="#" className="block py-2 text-sm font-medium hover:text-primary transition-colors">Electronics</a>
              <a href="#" className="block py-2 text-sm font-medium hover:text-primary transition-colors">Fashion</a>
              <a href="#" className="block py-2 text-sm font-medium hover:text-primary transition-colors">Home & Garden</a>
              <a href="#" className="block py-2 text-sm font-medium hover:text-primary transition-colors">Sports</a>
              <a href="#" className="block py-2 text-sm font-medium hover:text-primary transition-colors">Books</a>
              <a href="#" className="block py-2 text-sm font-medium hover:text-primary transition-colors">Sale</a>
            </nav>
            <Button className="w-full" variant="outline">
              <User className="h-4 w-4 mr-2" />
              My Account
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
