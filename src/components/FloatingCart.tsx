import React, { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useQuickCheckout } from '@/contexts/QuickCheckoutContext';
import { useCartProducts } from '@/hooks/useCartProducts';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getEcommerceSettings, EcommerceSettings } from '@/services/ecommerce-settings';
import { getStateShippingRates } from '@/services/state-shipping';
import { calculateShipping, calculateShippingSync } from '@/lib/shipping';

const FloatingCart = () => {
  const navigate = useNavigate();
  const { cartItems: rawCartItems, cartCount, removeFromCart, updateQuantity } = useCart();
  const { products: cartItems, cartTotal } = useCartProducts(rawCartItems);
  const { clearQuickCheckout } = useQuickCheckout();
  const [isOpen, setIsOpen] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [ecomSettings, setEcomSettings] = useState<EcommerceSettings>({
    cod: true,
    onlinePay: true,
    tamilNaduShipping: '50',
    otherStateShipping: '150',
    tamilNaduFreeShipping: '750',
    otherStateFreeShipping: '1000'
  });
  const [stateRates, setStateRates] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({ charges: 0, isFree: false, isTamilNadu: false, freeShippingThreshold: 0, remainingForFreeShipping: 0 });
  
  // Fetch ecommerce settings and state rates
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settings, rates] = await Promise.all([
          getEcommerceSettings(),
          getStateShippingRates()
        ]);
        setEcomSettings(settings);
        setStateRates(rates);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Calculate shipping for Tamil Nadu (default state for cart preview)
  React.useEffect(() => {
    const updateShipping = async () => {
      if (stateRates.length > 0) {
        const info = await calculateShipping({
          cartTotal,
          state: 'Tamil Nadu',
          ecomSettings,
          stateRates
        });
        setShippingInfo(info);
      } else {
        const info = calculateShippingSync({
          cartTotal,
          state: 'Tamil Nadu',
          ecomSettings
        });
        setShippingInfo(info);
      }
    };
    
    updateShipping();
  }, [cartTotal, ecomSettings, stateRates]);

  const handleCloseCart = () => {
    if (cartItems.length > 0) {
      setShowCloseConfirm(true);
    } else {
      setIsOpen(false);
    }
  };

  const confirmClose = () => {
    setShowCloseConfirm(false);
    setIsOpen(false);
  };

  const cancelClose = () => {
    setShowCloseConfirm(false);
  };

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
          <div className="fixed inset-x-4 top-4 bottom-4 sm:right-4 sm:left-auto sm:top-20 sm:bottom-20 sm:w-96 bg-white shadow-2xl z-50 flex flex-col rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Your Cart ({cartCount})</h2>
              <button onClick={handleCloseCart} className="p-2 hover:bg-gray-100 rounded-full">
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
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span className={`${shippingInfo.isFree ? 'text-green-600' : 'text-gray-600'}`}>
                      {shippingInfo.isFree ? 'Free' : 'Calculated at checkout'}
                    </span>
                  </div>
                  {!shippingInfo.isFree && shippingInfo.remainingForFreeShipping > 0 && (
                    <div className="text-xs text-green-600 mt-1 p-2 bg-green-50 rounded border border-green-200">
                      🎉 Add {formatPrice(shippingInfo.remainingForFreeShipping)} more for free shipping in Tamil Nadu!
                    </div>
                  )}
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-3">
                  <span>Total:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {shippingInfo.isFree && shippingInfo.freeShippingThreshold > 0 && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-green-700">You Save:</span>
                      <span className="text-xs font-bold text-green-600">
                        {formatPrice(shippingInfo.isTamilNadu ? parseFloat(ecomSettings.tamilNaduShipping) : parseFloat(ecomSettings.otherStateShipping))}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      🎉 Free shipping applied!
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <button 
                    onClick={() => { setIsOpen(false); navigate('/cart'); }} 
                    className="text-primary hover:text-primary/80 text-sm underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    View Cart
                  </button>
                </div>
                <div className="flex justify-center">
                  <Button onClick={() => { 
                    setIsOpen(false);
                    clearQuickCheckout();
                    if (window.location.pathname === '/checkout') {
                      window.location.reload();
                    } else {
                      navigate('/checkout');
                    }
                  }} className="w-3/4 bg-green-600 hover:bg-green-700 animate-wobble">Checkout</Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Close Confirmation Modal */}
      {showCloseConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={cancelClose} />
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Cancel Payment?
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to cancel this payment? You have {cartCount} item{cartCount > 1 ? 's' : ''} in your cart.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={cancelClose}
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50"
                  >
                    Stay Here
                  </Button>
                  <Button
                    onClick={confirmClose}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    Yes, Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FloatingCart;