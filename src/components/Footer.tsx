import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Youtube, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation, LANGUAGES } from './TranslationProvider';

const Footer = () => {
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch brands from API
    fetch('https://api.dharaniherbbals.com/api/brands')
      .then(response => response.json())
      .then(data => {
        let brandNames = [];
        
        // Try different ways to extract brand names based on API structure
        if (Array.isArray(data)) {
          // Direct array of brands
          brandNames = data.map(brand => brand.name || brand.Name || brand.title || brand).filter(Boolean);
        } else if (data && data.data && Array.isArray(data.data)) {
          // Strapi format with data wrapper
          brandNames = data.data.map(brand => {
            if (brand.attributes) {
              return brand.attributes.name || brand.attributes.Name || brand.attributes.title;
            }
            return brand.name || brand.Name || brand.title;
          }).filter(Boolean);
        }
        
        // If still empty, fallback to hardcoded brands
        if (brandNames.length === 0) {
          brandNames = ['Dharani', 'Ayush', 'Patanjali', 'Himalaya', 'Dabur'];
        }
        
        setBrands(brandNames);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching brands:', error);
        // Fallback to hardcoded brands
        setBrands(['Dharani', 'Ayush', 'Patanjali', 'Himalaya', 'Dabur']);
        setLoading(false);
      });
  }, []);
  
  return (
    <footer className="bg-primary/5 border-t border-primary/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <Leaf className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <h3 className="text-xl md:text-2xl font-bold text-primary">Dharani Herbals</h3>
            </div>
            <p className={`text-sm md:text-base text-muted-foreground ${isTamil ? 'tamil-text' : ''}`}>
              Your trusted partner in natural wellness. Bringing you authentic herbal products 
              and traditional remedies for a healthier lifestyle.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Youtube className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-primary text-base md:text-lg">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className={`text-sm md:text-base text-muted-foreground hover:text-primary transition-colors ${isTamil ? 'tamil-text' : ''}`}>About Us</Link></li>
              <li><Link to="/contact" className={`text-sm md:text-base text-muted-foreground hover:text-primary transition-colors ${isTamil ? 'tamil-text' : ''}`}>Contact</Link></li>
              <li><a href="#" className={`text-sm md:text-base text-muted-foreground hover:text-primary transition-colors ${isTamil ? 'tamil-text' : ''}`}>FAQ</a></li>
              <li><Link to="/shipping" className={`text-sm md:text-base text-muted-foreground hover:text-primary transition-colors ${isTamil ? 'tamil-text' : ''}`}>Shipping Info</Link></li>
              <li><a href="#" className={`text-sm md:text-base text-muted-foreground hover:text-primary transition-colors ${isTamil ? 'tamil-text' : ''}`}>Returns</a></li>
            </ul>
          </div>

          {/* Brands - Dynamic from API */}
          <div className="space-y-4">
            <h4 className="font-semibold text-primary text-base md:text-lg">Brands</h4>
            <ul className="space-y-2">
              {loading ? (
                <li className={`text-sm text-muted-foreground ${isTamil ? 'tamil-text' : ''}`}>Loading brands...</li>
              ) : brands.length > 0 ? (
                brands.map((brand, index) => (
                  <li key={index}>
                    <Link 
                      to={`/products?brand=${encodeURIComponent(brand)}`} 
                      className={`text-sm md:text-base text-muted-foreground hover:text-primary transition-colors ${isTamil ? 'tamil-text' : ''}`}
                    >
                      {brand}
                    </Link>
                  </li>
                ))
              ) : (
                <li className={`text-sm text-muted-foreground ${isTamil ? 'tamil-text' : ''}`}>No brands found</li>
              )}
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-4">
            <h4 className="font-semibold text-primary text-base md:text-lg">Support & Policies</h4>
            <ul className="space-y-2">
              <li><a href="#" className={`text-sm md:text-base text-muted-foreground hover:text-primary transition-colors ${isTamil ? 'tamil-text' : ''}`}>My Account</a></li>
              <li><a href="#" className={`text-sm md:text-base text-muted-foreground hover:text-primary transition-colors ${isTamil ? 'tamil-text' : ''}`}>Order Tracking</a></li>
              <li><Link to="/privacy" className={`text-sm md:text-base text-muted-foreground hover:text-primary transition-colors ${isTamil ? 'tamil-text' : ''}`}>Privacy Policy</Link></li>
              <li><Link to="/terms" className={`text-sm md:text-base text-muted-foreground hover:text-primary transition-colors ${isTamil ? 'tamil-text' : ''}`}>Terms & Conditions</Link></li>
              <li><a href="#" className={`text-sm md:text-base text-muted-foreground hover:text-primary transition-colors ${isTamil ? 'tamil-text' : ''}`}>Support Center</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-muted-foreground">
          <p className={`text-xs md:text-sm ${isTamil ? 'tamil-text' : ''}`}>
            &copy; {new Date().getFullYear()} Dharani Herbals. All rights reserved.
          </p>
          <p className="text-xs mt-2">
            Developed by <a href="https://www.thinkaside.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ThinkAside</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;