import React, { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const StickyCart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (totalItems === 0) return null;
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
        aria-label="View Cart"
      >
        <ShoppingCart className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
          {totalItems}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-[65%] sm:w-80 bg-white shadow-2xl z-[60] flex flex-col">
            <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
              <h2 className="text-base font-bold">Your Cart ({totalItems})</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-2 border-b pb-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-contain bg-gray-50 rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs line-clamp-2">{item.name}</h3>
                    <p className="text-xs text-gray-600">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">-</button>
                      <span className="text-xs">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">+</button>
                      <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-500 text-xs">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-3 space-y-2 flex-shrink-0">
              <div className="flex justify-between font-bold text-base">
                <span>Total:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <Button onClick={() => { setIsOpen(false); navigate('/cart'); }} className="w-full text-sm py-2">View Cart</Button>
              <Button onClick={() => { setIsOpen(false); navigate('/checkout'); }} className="w-full bg-green-600 hover:bg-green-700 text-sm py-2">Checkout</Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default StickyCart;
