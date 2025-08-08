import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, X, Search, ShoppingCart, Heart, User, Leaf, Globe, Phone, Mail } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlistContext } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation, LANGUAGES } from './TranslationProvider';
import { useSearch } from '@/hooks/use-search';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { searchQuery, setSearchQuery, handleSearch, clearSearch } = useSearch();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlistContext();
  const { user, logout, isAuthenticated } = useAuth();
  const { translate, language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const isTamil = language === LANGUAGES.TAMIL;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
      clearSearch();
      setIsMenuOpen(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === LANGUAGES.ENGLISH ? LANGUAGES.TAMIL : LANGUAGES.ENGLISH);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-primary/90 to-green-600 text-white py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+91 97881 22001</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@dharaniherbbals.in</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search Bar in Top Header */}
              <div className="flex flex-1 max-w-xs mx-4">
                <form onSubmit={onSearchSubmit} className="relative w-full">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-16 h-8 border-white/50 focus:border-white rounded-full bg-white focus:bg-white transition-all text-sm text-gray-700 placeholder-gray-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  {searchQuery && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={clearSearch}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 px-1 rounded-full hover:bg-gray-100 text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 px-2 rounded-full bg-primary hover:bg-primary/90 text-white border-0"
                  >
                    <Search className="w-3 h-3" />
                  </Button>
                </form>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="text-white hover:bg-white/20 h-8 px-3"
              >
                <Globe className="w-4 h-4 mr-1" />
                {language === LANGUAGES.ENGLISH ? 'தமிழ்' : 'English'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white/95 backdrop-blur-md border-b-2 border-primary sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src="https://api.dharaniherbbals.com/uploads/logo_12f2d3e78e.png" 
                alt="Dharani Herbals" 
                className="h-10 md:h-12 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full items-center justify-center shadow-lg" style={{display: 'none'}}>
                <Leaf className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
            </Link>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center justify-center flex-1 space-x-8">
              <Link 
                to="/" 
                className={`font-medium transition-colors hover:text-primary ${isTamil ? 'tamil-text' : ''}`}
              >
                {translate('header.home')}
              </Link>
              <Link 
                to="/products" 
                className={`font-medium transition-colors hover:text-primary ${isTamil ? 'tamil-text' : ''}`}
              >
                {translate('header.products')}
              </Link>
              <Link 
                to="/about" 
                className={`font-medium transition-colors hover:text-primary ${isTamil ? 'tamil-text' : ''}`}
              >
                {translate('header.about')}
              </Link>
              <Link 
                to="/contact" 
                className={`font-medium transition-colors hover:text-primary ${isTamil ? 'tamil-text' : ''}`}
              >
                {translate('header.contact')}
              </Link>
            </nav>



            {/* Action Buttons */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="md:hidden p-2"
              >
                <Globe className="w-5 h-5" />
              </Button>

              {/* Wishlist */}
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 p-2">
                  <Heart className="w-4 h-4 md:w-5 md:h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
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
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-2">
                  <Link to="/profile">
                    <Button variant="ghost" size="icon" title={`Profile (${user?.username})`} className="hover:bg-primary/10 p-2">
                      <User className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-primary/10 text-xs px-3">
                    Logout
                  </Button>
                </div>
              ) : (
                <Link to="/login" className="hidden md:block">
                  <Button variant="ghost" size="icon" title={translate('header.login')} className="hover:bg-primary/10 p-2">
                    <User className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <form onSubmit={onSearchSubmit} className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20 h-9 border-gray-300 focus:border-primary rounded-full bg-gray-50 focus:bg-white text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              {searchQuery && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={clearSearch}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 h-7 px-1 rounded-full hover:bg-gray-200"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-2 rounded-full"
              >
                <Search className="w-3 h-3" />
              </Button>
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                <Link 
                  to="/" 
                  className={`text-foreground hover:text-primary transition-colors font-medium text-base ${isTamil ? 'tamil-text' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {translate('header.home')}
                </Link>
                <Link 
                  to="/products" 
                  className={`text-foreground hover:text-primary transition-colors font-medium text-base ${isTamil ? 'tamil-text' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {translate('header.products')}
                </Link>
                <Link 
                  to="/about" 
                  className={`text-foreground hover:text-primary transition-colors font-medium text-base ${isTamil ? 'tamil-text' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {translate('header.about')}
                </Link>
                <Link 
                  to="/contact" 
                  className={`text-foreground hover:text-primary transition-colors font-medium text-base ${isTamil ? 'tamil-text' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {translate('header.contact')}
                </Link>
                
                <div className="border-t pt-4 mt-4">
                  {isAuthenticated ? (
                    <>
                      <Link 
                        to="/profile" 
                        className={`text-foreground hover:text-primary transition-colors font-medium text-base block mb-3 ${isTamil ? 'tamil-text' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile ({user?.username})
                      </Link>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          handleLogout();
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
                      className={`text-foreground hover:text-primary transition-colors font-medium text-base ${isTamil ? 'tamil-text' : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {translate('header.login')}
                    </Link>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;