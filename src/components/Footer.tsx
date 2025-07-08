import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Youtube, Leaf, Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation, LANGUAGES } from './TranslationProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    // Fetch brands from API
    fetch('https://api.dharaniherbbals.com/api/brands')
      .then(response => response.json())
      .then(data => {
        let brandNames = [];
        
        if (Array.isArray(data)) {
          brandNames = data.map(brand => brand.name || brand.Name || brand.title || brand).filter(Boolean);
        } else if (data && data.data && Array.isArray(data.data)) {
          brandNames = data.data.map(brand => {
            if (brand.attributes) {
              return brand.attributes.name || brand.attributes.Name || brand.attributes.title;
            }
            return brand.name || brand.Name || brand.title;
          }).filter(Boolean);
        }
        
        if (brandNames.length === 0) {
          brandNames = ['Dharani', 'Ayush', 'Patanjali', 'Himalaya', 'Dabur'];
        }
        
        setBrands(brandNames);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching brands:', error);
        setBrands(['Dharani', 'Ayush', 'Patanjali', 'Himalaya', 'Dabur']);
        setLoading(false);
      });
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };
  
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-primary to-green-600 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated with Natural Wellness</h3>
            <p className="text-lg mb-8 opacity-90">
              Get the latest updates on herbal products, health tips, and exclusive offers
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-12 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
              />
              <Button 
                type="submit" 
                className="bg-white text-primary hover:bg-gray-100 h-12 px-6 font-semibold"
              >
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Company Info */}
          <div className="space-y-6 lg:col-span-1">
            <div className="flex items-center">
              <img 
                src="https://api.dharaniherbbals.com/uploads/logo_12f2d3e78e.png" 
                alt="Dharani Herbals" 
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full items-center justify-center" style={{display: 'none'}}>
                <Leaf className="w-8 h-8 text-white" />
              </div>
            </div>
            {/* <p className={`text-gray-300 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
              Your trusted partner in natural wellness. Bringing you authentic herbal products 
              and traditional remedies for a healthier lifestyle.
            </p> */}
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-gray-300">+91 97881 22001</span>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary mt-1" />
                <div className="text-gray-300">
                  <div>info@dharaniherbbals.in</div>
                  <div>salesdharani@gmail.com</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <span className="text-gray-300">
                  7/470-1, Chemparuthi Street,<br />
                  West Nehru Nagar Punjai Puliampatti<br />
                  Sathyamangalam(TALUK), Erode - 638 459, TN, India
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-gray-300">Mon - Sat: 9:00 AM - 7:00 PM</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-bold text-xl text-white border-b border-gray-700 pb-3">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/products" className={`text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                All Products
              </Link></li>
              <li><Link to="/products?type=deals" className={`text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Deals of the Day
              </Link></li>
              <li><Link to="/products?type=trending" className={`text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Trending Products
              </Link></li>
              <li><Link to="/contact" className={`text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Contact Us
              </Link></li>
              <li><Link to="/cart" className={`text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Shopping Cart
              </Link></li>
            </ul>
          </div>

          {/* Brands */}
          <div className="space-y-6">
            <h4 className="font-bold text-xl text-white border-b border-gray-700 pb-3">Our Brands</h4>
            <ul className="space-y-3">
              {loading ? (
                <li className={`text-gray-300 ${isTamil ? 'tamil-text' : ''}`}>Loading brands...</li>
              ) : brands.length > 0 ? (
                brands.slice(0, 6).map((brand, index) => (
                  <li key={index}>
                    <Link 
                      to={`/products?brand=${encodeURIComponent(brand)}`} 
                      className={`text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}
                    >
                      <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {brand}
                    </Link>
                  </li>
                ))
              ) : (
                <li className={`text-gray-300 ${isTamil ? 'tamil-text' : ''}`}>No brands found</li>
              )}
            </ul>
          </div>

          {/* Support & Policies */}
          <div className="space-y-6">
            <h4 className="font-bold text-xl text-white border-b border-gray-700 pb-3">Support & Policies</h4>
            <ul className="space-y-3">
              <li><Link to="/profile" className={`text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                My Account
              </Link></li>
              <li><a href="#" className={`text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Order Tracking
              </a></li>
              <li><Link to="/privacy" className={`text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Privacy Policy
              </Link></li>
              <li><Link to="/terms" className={`text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Terms & Conditions
              </Link></li>
              <li><Link to="/refund-returns" className={`text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Refund/Returns
              </Link></li>
              <li><Link to="/shipping" className={`text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Shipping
              </Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className={`text-sm text-gray-400 ${isTamil ? 'tamil-text' : ''}`}>
                &copy; {new Date().getFullYear()} Dharani Herbals. All rights reserved.
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">
                Developed by <a href="https://www.thinkaside.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-green-400 transition-colors font-medium">ThinkAside</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;