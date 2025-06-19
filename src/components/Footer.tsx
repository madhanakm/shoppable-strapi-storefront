
import React from 'react';
import { Facebook, Instagram, Youtube, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary/5 border-t border-primary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Leaf className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold text-primary">Dharani Herbals</h3>
            </div>
            <p className="text-muted-foreground">
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
            <h4 className="font-semibold text-primary">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
              <li><Link to="/shipping" className="text-muted-foreground hover:text-primary transition-colors">Shipping Info</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Returns</a></li>
            </ul>
          </div>

          {/* Product Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold text-primary">Product Categories</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Ayurvedic Medicines</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Herbal Supplements</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Natural Oils</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Herbal Teas</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Skin & Hair Care</a></li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-4">
            <h4 className="font-semibold text-primary">Support & Policies</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">My Account</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Order Tracking</a></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support Center</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 Dharani Herbals. All rights reserved. Natural wellness solutions for a healthier tomorrow.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
