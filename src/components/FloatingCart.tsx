import React, { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useQuickCheckout } from '@/contexts/QuickCheckoutContext';
import { useCartProducts } from '@/hooks/useCartProducts';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const FloatingCart = () => {
  const navigate = useNavigate();
  const { cartItems: rawCartItems, cartCount, removeFromCart, updateQuantity } = useCart();
  const { products: cartItems, cartTotal } = useCartProducts(rawCartItems);
  const { clearQuickCheckout } = useQuickCheckout();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-6 z-50 bg-primary hover:bg-primary/90 text-white rounded-full p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
      >
        <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center font-bold">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsOpen(false)} />
          <div className="fixed right-4 top-20 bottom-20 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Your Cart ({cartCount})</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.length === 0 ? (
                <p className="text-center text-gray-500 mt-8">Your cart is empty</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.skuid} className="flex gap-3 border-b pb-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-contain bg-gray-50 rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQuantity(item.skuid, item.quantity - 1)} className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">-</button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.skuid, item.quantity + 1)} className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">+</button>
                        <button onClick={() => removeFromCart(item.skuid)} className="ml-auto text-red-500 text-xs hover:text-red-700">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t p-4 space-y-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <Button onClick={() => { setIsOpen(false); navigate('/cart'); }} className="w-full">View Cart</Button>
                <Button onClick={() => { 
                  setIsOpen(false);
                  clearQuickCheckout();
                  if (window.location.pathname === '/checkout') {
                    window.location.reload();
                  } else {
                    navigate('/checkout');
                  }
                }} className="w-full bg-green-600 hover:bg-green-700">Checkout</Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default FloatingCart;