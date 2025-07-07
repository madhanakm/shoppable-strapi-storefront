import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/components/TranslationProvider';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const { translate } = useTranslation();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 md:space-x-3">
            <img 
              src="/lovable-uploads/6416e97f-9561-4de9-a193-d5af27824b56.png" 
              alt="Dharani Herbals"
              className="h-6 md:h-8 lg:h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium text-sm lg:text-base">{translate('header.home')}</Link>
            <Link to="/products" className="text-foreground hover:text-primary transition-colors font-medium text-sm lg:text-base">{translate('header.products')}</Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium text-sm lg:text-base">{translate('header.about')}</Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-medium text-sm lg:text-base">{translate('header.contact')}</Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md mx-4 lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={translate('header.search') + '...'}
                className="pl-10 w-full border-primary/20 focus:border-primary text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 md:space-x-2 lg:space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Search - Mobile */}
            <Button variant="ghost" size="icon" className="md:hidden p-2">
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </Button>

            {/* Wishlist */}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 p-2">
                <Heart className="w-4 h-4 md:w-5 md:h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-xs">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 p-2">
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-xs">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link to="/profile">
                  <Button variant="ghost" size="icon" title={`Profile (${user?.username})`} className="hover:bg-primary/10 p-2">
                    <User className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleAuthClick} className="hover:bg-primary/10 text-xs">
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={handleAuthClick} title={translate('header.login')} className="hover:bg-primary/10 p-2">
                <User className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-4 h-4 md:w-5 md:h-5" /> : <Menu className="w-4 h-4 md:w-5 md:h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary transition-colors font-medium text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                {translate('header.home')}
              </Link>
              <Link 
                to="/products" 
                className="text-foreground hover:text-primary transition-colors font-medium text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                {translate('header.products')}
              </Link>
              <Link 
                to="/about" 
                className="text-foreground hover:text-primary transition-colors font-medium text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                {translate('header.about')}
              </Link>
              <Link 
                to="/contact" 
                className="text-foreground hover:text-primary transition-colors font-medium text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                {translate('header.contact')}
              </Link>
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/profile" 
                    className="text-foreground hover:text-primary transition-colors font-medium text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile ({user?.username})
                  </Link>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="justify-start font-medium text-base p-0 h-auto"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="text-foreground hover:text-primary transition-colors font-medium text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {translate('header.login')}
                </Link>
              )}
              {/* Mobile Search */}
              <div className="pt-4 border-t border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder={translate('header.search') + '...'}
                    className="pl-10 w-full border-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;