
import React from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">ShopHub</h3>
            <p className="text-muted-foreground">
              Your one-stop destination for quality products at unbeatable prices. 
              Shop with confidence and enjoy fast, secure delivery.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Youtube className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
              <li><Link to="/shipping" className="text-muted-foreground hover:text-primary transition-colors">Shipping Info</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Returns</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold">Categories</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Electronics</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Fashion</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Home & Garden</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Sports</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Books</a></li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-4">
            <h4 className="font-semibold">Legal & Policies</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">My Account</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Order Tracking</a></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support Center</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 ShopHub. All rights reserved. Developed with ❤️ by <a href="https://thinkaside.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ThinkAside</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
