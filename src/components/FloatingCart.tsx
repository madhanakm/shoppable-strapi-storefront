import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';

const FloatingCart = () => {
  const { cartCount } = useCart();

  // if (cartCount === 0) return null;

  return (
    <Link to="/cart">
      <div className="fixed right-4 bottom-28 z-50 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
        <ShoppingCart className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </div>
    </Link>
  );
};

export default FloatingCart;