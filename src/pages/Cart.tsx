import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useCartProducts } from '@/hooks/useCartProducts';
import { formatPrice } from '@/lib/utils';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import { getEcommerceSettings, EcommerceSettings } from '@/services/ecommerce-settings';
import { useQuickCheckout } from '@/hooks/useQuickCheckout';
import { getStateShippingRates } from '@/services/state-shipping';
import { calculateShipping, calculateShippingSync } from '@/lib/shipping';
import RelatedProducts from '@/components/RelatedProducts';


const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartCount } = useCart();
  const { products, loading, cartTotal } = useCartProducts(cartItems);
  const { language, translate } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const { clearQuickCheckout } = useQuickCheckout();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNavigationConfirm, setShowNavigationConfirm] = React.useState(false);
  const [pendingNavigation, setPendingNavigation] = React.useState(null);
  
  // Handle beforeunload event for browser navigation
  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (cartCount > 0) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to cancel this payment? You have items in your cart.';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [cartCount]);
  
  // Override navigation using history API - removed (was blocking React Router globally)
  
  const handleNavigationConfirm = () => {
    setShowNavigationConfirm(false);
    if (pendingNavigation) {
      pendingNavigation();
    }
  };
  
  const handleNavigationCancel = () => {
    setShowNavigationConfirm(false);
    setPendingNavigation(null);
  };
  const [ecomSettings, setEcomSettings] = React.useState<EcommerceSettings>({
    cod: true,
    onlinePay: true,
    tamilNaduShipping: '50',
    otherStateShipping: '150',
    tamilNaduFreeShipping: '750',
    otherStateFreeShipping: '1000'
  });
  const [stateRates, setStateRates] = React.useState([]);
  const [shippingInfo, setShippingInfo] = React.useState({ charges: 0, isFree: false, isTamilNadu: false, freeShippingThreshold: 0, remainingForFreeShipping: 0 });
  
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


  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Header />
        <main className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-8">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent ${isTamil ? 'tamil-text' : ''}`}>
              {translate('cart.empty')}
            </h1>
            <p className={`text-gray-600 text-lg mb-8 ${isTamil ? 'tamil-text' : ''}`}>
              Looks like you haven't added any items to your cart yet
            </p>
            <Link to="/products">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg px-8 py-3">
                <ShoppingBag className="w-5 h-5 mr-2" />
                <span className={isTamil ? 'tamil-text' : ''}>{translate('cart.continueShopping')}</span>
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <SEOHead 
        title="Shopping Cart"
        description="Review your selected items and proceed to checkout. Secure shopping cart with easy quantity management."
        url="/cart"
      />
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full mb-4">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 ${isTamil ? 'tamil-text' : ''}`}>
              {translate('cart.title')}
            </h1>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 md:p-8">
                  <div className="space-y-6">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className={`mt-4 text-gray-600 ${isTamil ? 'tamil-text' : ''}`}>{translate('common.loading')}</p>
                      </div>
                    ) : (
                      products.map((item, index) => (
                      <div key={item.id} className={`${index !== 0 ? 'border-t pt-6' : ''}`}>
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl shadow-md overflow-hidden">
                              <Link to={`/product/${item.id}`}>
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300 cursor-pointer"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/150x150?text=Product';
                                  }}
                                />
                              </Link>
                            </div>
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                              <div className="flex-1">
                                <Link to={`/product/${item.id}`}>
                                  <h3 className={`font-bold text-lg md:text-xl text-gray-800 mb-2 hover:text-primary transition-colors cursor-pointer uppercase ${isTamil ? 'tamil-text' : ''}`}>
                                    {isTamil && item.tamil ? item.tamil : item.name}
                                  </h3>
                                </Link>
                                <p className="text-sm text-gray-500 mb-3">{item.category}</p>
                                <p className="text-2xl font-bold text-primary">
                                  {formatPrice(item.price)}
                                </p>
                              </div>
                              
                              {/* Quantity Controls */}
                              <div className="flex flex-col sm:items-end gap-4">
                                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => updateQuantity(item.skuid, item.quantity - 1)}
                                    className="h-10 w-10 rounded-md hover:bg-white"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.skuid, parseInt(e.target.value) || 1)}
                                    className="w-16 text-center border-0 bg-transparent font-semibold"
                                    min="1"
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => updateQuantity(item.skuid, item.quantity + 1)}
                                    className="h-10 w-10 rounded-md hover:bg-white"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                                
                                <div className="text-right">
                                  <p className="text-xl font-bold text-gray-800 mb-2">
                                    {formatPrice(item.price * item.quantity)}
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeFromCart(item.skuid)}
                                    className="flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span className={isTamil ? 'tamil-text' : ''}>{translate('cart.remove')}</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* You May Also Like - directly below cart items */}
              <RelatedProducts />
            </div>
            
            {/* Order Summary */}
            <div>
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm sticky top-8">
                <CardContent className="p-6 md:p-8">
                  <h2 className={`text-2xl font-bold mb-6 text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>{translate('cart.orderSummary')}</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-lg">
                      <span className={`text-gray-600 ${isTamil ? 'tamil-text' : ''}`}>{translate('cart.subtotal')}</span>
                      <span className="font-semibold">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-lg items-start">
                      <span className={`text-gray-600 ${isTamil ? 'tamil-text' : ''}`}>{translate('cart.shipping')}</span>
                      <span className={`font-semibold ${shippingInfo.isFree ? 'text-green-600' : 'text-gray-600'} ${isTamil ? 'tamil-text text-right' : 'text-right'} max-w-[60%]`}>
                        {shippingInfo.isFree ? translate('cart.free') : translate('cart.calculatedAtCheckout')}
                      </span>
                    </div>

                    <div className="flex justify-between text-lg">
                      <span className={`text-gray-600 ${isTamil ? 'tamil-text' : ''}`}>{translate('cart.tax')}</span>
                      <span className={`font-semibold text-gray-500 ${isTamil ? 'tamil-text' : ''}`}>{translate('cart.inclusive')}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span className={isTamil ? 'tamil-text' : ''}>{translate('cart.total')}</span>
                        <span className="text-primary">{formatPrice(cartTotal)}</span>
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 ${isTamil ? 'tamil-text' : ''}`}>
                        {translate('cart.finalShippingNote')}
                      </div>
                      {shippingInfo.isFree && shippingInfo.freeShippingThreshold > 0 && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium text-green-700 ${isTamil ? 'tamil-text' : ''}`}>You Save:</span>
                            <span className="text-sm font-bold text-green-600">
                              {formatPrice(shippingInfo.isTamilNadu ? parseFloat(ecomSettings.tamilNaduShipping) : parseFloat(ecomSettings.otherStateShipping))}
                            </span>
                          </div>
                          <p className={`text-xs text-green-600 mt-1 ${isTamil ? 'tamil-text' : ''}`}>
                            🎉 Free shipping applied!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Link to="/checkout" className="block" onClick={() => clearQuickCheckout()}>
                      <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg py-3 text-lg">
                        <span className={isTamil ? 'tamil-text' : ''}>{translate('cart.checkout')}</span>
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Link to="/products" className="block">
                      <Button variant="outline" className="w-full border-2 border-gray-300 hover:bg-gray-50 py-3">
                        <span className={isTamil ? 'tamil-text' : ''}>{translate('cart.continueShopping')}</span>
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Payment Badge */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 text-center mb-2">Secured & Powered by</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-5" onError={(e) => { e.currentTarget.style.display='none'; }} />
                      <span className="text-sm font-semibold text-[#072654]">Razorpay</span>
                      <span className="text-gray-300 hidden sm:inline">|</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">🔒 256-bit SSL &bull; PCI DSS Compliant</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
        </div>
      </main>
      
      {/* Navigation Confirmation Modal */}
      {showNavigationConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={handleNavigationCancel} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Cancel Payment?
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to cancel this payment? You have {cartCount} item{cartCount > 1 ? 's' : ''} in your cart.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleNavigationCancel}
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50"
                  >
                    Stay Here
                  </Button>
                  <Button
                    onClick={handleNavigationConfirm}
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
      
      <Footer />
    </div>
  );
};

export default Cart;