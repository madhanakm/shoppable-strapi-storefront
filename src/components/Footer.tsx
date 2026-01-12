import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Youtube, Leaf, Phone, Mail, MapPin, Clock, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation, LANGUAGES } from './TranslationProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const Footer = () => {
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappUpdate, setWhatsappUpdate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  
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
        
        setBrands(['Dharani', 'Ayush', 'Patanjali', 'Himalaya', 'Dabur']);
        setLoading(false);
      });
  }, []);

  const validateIndianMobile = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleanNumber);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = whatsappNumber.trim().replace(/\D/g, '');
    
    if (!cleanNumber) {
      setMessage(translate('footer.enterNumber'));
      setMessageType('error');
      return;
    }
    
    if (!validateIndianMobile(cleanNumber)) {
      setMessage(translate('footer.invalidNumber'));
      setMessageType('error');
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    
    try {
      // Check if number already exists
      const checkResponse = await fetch(`https://api.dharaniherbbals.com/api/subscribers?filters[whatsappNumber][$eq]=${cleanNumber}`);
      const checkResult = await checkResponse.json();
      
      if (checkResult.data && checkResult.data.length > 0) {
        setMessage(translate('footer.alreadySubscribed'));
        setMessageType('error');
        return;
      }
      
      // Create new subscription
      const response = await fetch('https://api.dharaniherbbals.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            whatsappNumber: cleanNumber,
            whatsappUpdate: whatsappUpdate
          }
        })
      });
      
      if (response.ok) {
        setWhatsappNumber('');
        setWhatsappUpdate(true);
        setMessage(translate('footer.subscribeSuccess'));
        setMessageType('success');
      } else {
        setMessage(translate('footer.subscribeError'));
        setMessageType('error');
      }
    } catch (error) {
      setMessage(translate('footer.subscribeError'));
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };
  
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-primary to-green-600 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className={`text-lg md:text-2xl lg:text-3xl font-bold mb-4 ${isTamil ? 'tamil-text' : ''}`}>
              {translate('footer.stayUpdated')}
            </h3>
            <p className={`text-sm md:text-lg mb-8 opacity-90 ${isTamil ? 'tamil-text' : ''}`}>
              {translate('footer.updatesDescription')}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="tel"
                  placeholder={translate('footer.whatsappPlaceholder')}
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  maxLength={10}
                  className="flex-1 h-12 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-white text-primary hover:bg-gray-100 h-12 px-6 font-semibold disabled:opacity-50"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? translate('footer.subscribing') : translate('footer.subscribe')}
                </Button>
              </div>
              
              {message && (
                <div className={`text-center p-3 rounded-lg ${messageType === 'success' ? 'bg-green-500/20 text-green-100 border border-green-400/30' : 'bg-red-500/20 text-red-100 border border-red-400/30'} ${isTamil ? 'tamil-text' : ''}`}>
                  {message}
                </div>
              )}
              
              <div className="flex items-center space-x-2 justify-center">
                <Checkbox 
                  id="whatsapp-updates"
                  checked={whatsappUpdate}
                  onCheckedChange={setWhatsappUpdate}
                  className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-primary"
                />
                <label 
                  htmlFor="whatsapp-updates" 
                  className={`text-sm text-white/90 cursor-pointer ${isTamil ? 'tamil-text' : ''}`}
                >
                  {translate('footer.whatsappUpdates')}
                </label>
              </div>
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
                  West Nehru Nagar, Punjai Puliampatti,<br />
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
              <a href="https://www.facebook.com/share/12JML3gctZN/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/dharani_herbbals?igsh=MXRueWJqMmtpZHRjOQ==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@dharaniherbbals1236?si=6fZfr3WVwFS6nLCC" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/HerbbalsDharani" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-bold text-base md:text-xl text-white border-b border-gray-700 pb-3">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/products" className={`text-sm md:text-base text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                All Products
              </Link></li>
              <li><Link to="/products?type=deals" className={`text-sm md:text-base text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Deals of the Day
              </Link></li>
              <li><Link to="/products?type=trending" className={`text-sm md:text-base text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Trending Products
              </Link></li>
              <li><Link to="/contact" className={`text-sm md:text-base text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Contact Us
              </Link></li>
              <li><Link to="/cart" className={`text-sm md:text-base text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Shopping Cart
              </Link></li>
            </ul>
          </div>

          {/* Brands */}
          <div className="space-y-6">
            <h4 className="font-bold text-base md:text-xl text-white border-b border-gray-700 pb-3">Our Brands</h4>
            <ul className="space-y-3">
              {loading ? (
                <li className={`text-gray-300 ${isTamil ? 'tamil-text' : ''}`}>Loading brands...</li>
              ) : brands.length > 0 ? (
                brands.slice(0, 6).map((brand, index) => (
                  <li key={index}>
                    <Link 
                      to={`/products?brand=${encodeURIComponent(brand)}`} 
                      className={`text-sm md:text-base text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}
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
            <h4 className="font-bold text-base md:text-xl text-white border-b border-gray-700 pb-3">Support & Policies</h4>
            <ul className="space-y-3">
              <li><Link to="/profile" className={`text-sm md:text-base text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                My Account
              </Link></li>
              <li><a href="#" className={`text-sm md:text-base text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Order Tracking
              </a></li>
              <li><Link to="/privacy" className={`text-sm md:text-base text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Privacy Policy
              </Link></li>
              <li><Link to="/terms" className={`text-sm md:text-base text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Terms & Conditions
              </Link></li>
              <li><Link to="/refund-returns" className={`text-sm md:text-base text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Refund/Returns
              </Link></li>
              <li><Link to="/shipping" className={`text-sm md:text-base text-gray-300 hover:text-primary transition-colors flex items-center group ${isTamil ? 'tamil-text' : ''}`}>
                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                Shipping
              </Link></li>
            </ul>
            
            {/* Play Store Download */}
            <div className="mt-6">
              <a 
                href="https://play.google.com/store/apps/details?id=com.dharaniherbbals.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-300">Available on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>
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
              <p className="text-sm text-gray-400 mt-1">
                Dharani Herbbals managed by ARUMUGAM POONKODI
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