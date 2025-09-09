import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useCartProducts } from '@/hooks/useCartProducts';
import { useAuth } from '@/contexts/AuthContext';
import { useQuickCheckout } from '@/contexts/QuickCheckoutContext';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { getAddresses } from '@/services/profile';
import { generateOrderNumber, generateInvoiceNumber, initiatePayment, OrderData } from '@/services/payment';
import { createPendingOrder, completePendingOrder, failPendingOrder, PendingOrderData } from '@/services/pending-orders';
import { sendOrderConfirmationSMS } from '@/services/order-sms';
import { getEcommerceSettings, EcommerceSettings } from '@/services/ecommerce-settings';
import { calculateShipping } from '@/lib/shipping';
import { CreditCard, MapPin, User, Phone, Mail, ShieldCheck, ArrowRight, Package, Plus } from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import { recoverPendingPayments } from '@/services/payment-recovery';

const Checkout = () => {
  const { cartItems: regularCartItems, clearCart } = useCart();
  const { quickCheckoutItem, clearQuickCheckout } = useQuickCheckout();
  const { user, isAuthenticated, loading } = useAuth();
  
  // Determine checkout mode - prioritize quick checkout when it exists
  const isQuickCheckout = !!quickCheckoutItem;
  
  // Always process regular cart items through useCartProducts
  const { products: processedCartItems, loading: cartLoading, cartTotal: processedCartTotal } = useCartProducts(regularCartItems);
  
  // Use appropriate cart data based on checkout type
  const cartItems = isQuickCheckout ? [quickCheckoutItem] : processedCartItems;
  const cartTotal = isQuickCheckout 
    ? quickCheckoutItem.price * quickCheckoutItem.quantity 
    : processedCartTotal;
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [differentBillingAddress, setDifferentBillingAddress] = useState(false);
  const [useManualAddress, setUseManualAddress] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [ecomSettings, setEcomSettings] = useState<EcommerceSettings>({ cod: true, onlinePay: true, minimumOrderValueTamilNadu: '0', minimumOrderValueOtherState: '0' });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  
  const [formData, setFormData] = useState({
    // Billing Info
    fullName: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    
    // Manual Shipping Address
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingPincode: '',
    
    // Manual Billing Address
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingPincode: '',
    
    // Payment
    paymentMethod: 'online',
    
    // Additional
    notes: ''
  });
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login?redirect=checkout');
      return;
    }
    
    // Recover any pending payments on checkout load
    recoverPendingPayments();
    
    if (user?.id) {
      if (currentUserId !== null && user.id !== currentUserId) {
        
        setAddresses([]);
        setSelectedShippingAddress(null);
        setSelectedBillingAddress(null);
      }
      setCurrentUserId(user.id);
    }
    
    loadAddresses();
  }, [user?.id, isAuthenticated, navigate, loading, currentUserId]);
  
  // Fetch ecommerce settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const settings = await getEcommerceSettings();

        setEcomSettings(settings);
        
        // Set default payment method based on available options
        if (!settings.cod && settings.onlinePay) {
          setFormData(prev => ({ ...prev, paymentMethod: 'online' }));
        } else if (settings.cod && !settings.onlinePay) {
          setFormData(prev => ({ ...prev, paymentMethod: 'cod' }));
        } else if (!settings.cod && !settings.onlinePay) {
          // Both payment methods are disabled
        }
      } catch (error) {
        // Error handling
      } finally {
        setIsLoadingSettings(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const loadAddresses = async () => {
    if (user?.id) {
      try {
        
        const userAddresses = await getAddresses(user.id);
        
        setAddresses(userAddresses || []);
        if (userAddresses && userAddresses.length > 0) {
          setSelectedShippingAddress(userAddresses[0]);
        } else {
          setSelectedShippingAddress(null);
        }
        setSelectedBillingAddress(null);
      } catch (error) {
        
        setAddresses([]);
        setSelectedShippingAddress(null);
        setSelectedBillingAddress(null);
      }
    } else {
      
      setAddresses([]);
      setSelectedShippingAddress(null);
      setSelectedBillingAddress(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate minimum order value (including shipping charges)
    if (minimumOrderValue > 0 && total < minimumOrderValue) {
      toast({
        title: "Minimum Order Value Not Met",
        description: `Minimum order value is ${formatPrice(minimumOrderValue)}. Please add more items to your cart.`,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Validate payment method is available
    if (formData.paymentMethod === 'cod' && !ecomSettings.cod) {
      toast({
        title: "Payment Method Unavailable",
        description: "Cash on Delivery is currently unavailable. Please choose another payment method.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    if (formData.paymentMethod === 'online' && !ecomSettings.onlinePay) {
      toast({
        title: "Payment Method Unavailable",
        description: "Online Payment is currently unavailable. Please choose another payment method.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Generate order number only (invoice number generated only for successful orders)
      const orderNumber = await generateOrderNumber();
      
      // Get address info
      let shippingAddr = '';
      if (selectedShippingAddress && !useManualAddress) {
        const attrs = selectedShippingAddress.attributes || selectedShippingAddress;
        shippingAddr = `${attrs.address}, ${attrs.city}, ${attrs.state} - ${attrs.pincode}`;
      } else {
        shippingAddr = `${formData.shippingAddress}, ${formData.shippingCity}, ${formData.shippingState} - ${formData.shippingPincode}`;
      }

      if (formData.paymentMethod === 'online') {
        // Create pending order first (without invoice number)
        const pendingOrderData: PendingOrderData = {
          orderNumber,
          invoiceNumber: '', // No invoice number for pending orders
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            skuid: item.originalSkuid || item.skuid || item.id
          })),
          total: total,
          shippingCharges: shippingCharges,
          customerInfo: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.shippingAddress || selectedShippingAddress?.attributes?.address || selectedShippingAddress?.address || '',
            city: formData.shippingCity || selectedShippingAddress?.attributes?.city || selectedShippingAddress?.city || '',
            state: formData.shippingState || selectedShippingAddress?.attributes?.state || selectedShippingAddress?.state || '',
            pincode: formData.shippingPincode || selectedShippingAddress?.attributes?.pincode || selectedShippingAddress?.pincode || ''
          },
          paymentMethod: 'online',
          notes: formData.notes,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        // Create pending order
        const pendingOrderId = await createPendingOrder(pendingOrderData);
        if (!pendingOrderId) {
          throw new Error('Failed to create pending order record');
        }

        // Prepare order data for Razorpay
        const orderData: OrderData = {
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            skuid: item.originalSkuid || item.skuid || item.id
          })),
          total: total,
          shippingCharges: shippingCharges,
          customerInfo: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.shippingAddress || selectedShippingAddress?.attributes?.address || selectedShippingAddress?.address || '',
            city: formData.shippingCity || selectedShippingAddress?.attributes?.city || selectedShippingAddress?.city || '',
            state: formData.shippingState || selectedShippingAddress?.attributes?.state || selectedShippingAddress?.state || '',
            pincode: formData.shippingPincode || selectedShippingAddress?.attributes?.pincode || selectedShippingAddress?.pincode || ''
          }
        };

        // Initiating payment
        try {
          // Generate invoice number only for successful payment
          const invoiceNumber = await generateInvoiceNumber();
          // Initiate Razorpay payment
          await initiatePayment(orderData, orderNumber, invoiceNumber, formData.notes);
          
          toast({
            title: "Payment Successful!",
            description: `Order #${orderNumber} placed successfully. You will receive a confirmation SMS shortly.`,
          });
        } catch (paymentError) {
          console.error('Payment error:', paymentError);
          // Only update to failed if it's not a cancellation
          if (!paymentError.message?.includes('Payment cancelled')) {
            await failPendingOrder(orderNumber, paymentError.message || 'Payment failed');
          }
          throw new Error(paymentError.message || 'Payment failed');
        }
      } else {
        // COD Order - Create pending order first (without invoice number), then store
        const pendingOrderData: PendingOrderData = {
          orderNumber,
          invoiceNumber: '', // No invoice number for pending COD orders
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            skuid: item.originalSkuid || item.skuid || item.id
          })),
          total: total,
          shippingCharges: shippingCharges,
          customerInfo: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.shippingAddress || selectedShippingAddress?.attributes?.address || selectedShippingAddress?.address || '',
            city: formData.shippingCity || selectedShippingAddress?.attributes?.city || selectedShippingAddress?.city || '',
            state: formData.shippingState || selectedShippingAddress?.attributes?.state || selectedShippingAddress?.state || '',
            pincode: formData.shippingPincode || selectedShippingAddress?.attributes?.pincode || selectedShippingAddress?.pincode || ''
          },
          paymentMethod: 'cod',
          notes: formData.notes,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        // Validate customer info before creating order
        if (!pendingOrderData.customerInfo.name || !pendingOrderData.customerInfo.email || !pendingOrderData.customerInfo.phone) {
          throw new Error('Missing required customer information');
        }
        
        // Create pending order with error handling
        let pendingOrderId: string;
        try {
          pendingOrderId = await createPendingOrder(pendingOrderData);
          if (!pendingOrderId) {
            throw new Error('No order ID returned');
          }
        } catch (error) {
          console.error('Failed to create pending order:', error);
          throw new Error(`Failed to create order record: ${error.message}`);
        }
        
        // Generate invoice number for COD orders
        const invoiceNumber = await generateInvoiceNumber();
        
        const orderPayload = {
          data: {
            ordernum: orderNumber,
            invoicenum: invoiceNumber,
            totalValue: total,
            total: total,
            shippingCharges: shippingCharges,
            shippingRate: shippingCharges, // Adding shipping rate as a separate field
            customername: formData.fullName,
            phoneNum: formData.phone,
            email: formData.email,
            communication: 'website',
            payment: 'COD',
            shippingAddress: shippingAddr,
            billingAddress: shippingAddr,
            Name: cartItems.map(item => item.name).join(' | '),
            price: cartItems.map(item => `${item.name}: ${formatPrice(item.price)} x ${item.quantity}`).join(' | '),
            skuid: cartItems.map(item => item.originalSkuid || item.skuid || item.id).join(' | '),
            remarks: formData.notes || 'No special notes',
            quantity: String(cartItems.reduce((sum, item) => sum + item.quantity, 0))
          }
        };

        // Validate required fields
        if (!formData.fullName || !formData.email || !formData.phone || !shippingAddr) {
          await failPendingOrder(orderNumber, 'Missing required customer information');
          throw new Error('Missing required customer information');
        }
        
        // Invoice number already generated above
        
        // Placing COD order
        let response: Response;
        let responseText: string;
        
        try {
          response = await fetch('https://api.dharaniherbbals.com/api/orders', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(orderPayload)
          });

          responseText = await response.text();
          
          if (!response.ok) {
            // Update pending order status to failed
            await failPendingOrder(orderNumber, `API Error: ${response.status} - ${responseText}`);
            throw new Error(`Failed to place order: ${response.status} - ${responseText}`);
          }
        } catch (fetchError) {
          await failPendingOrder(orderNumber, `Network error: ${fetchError.message}`);
          throw new Error(`Network error while placing order: ${fetchError.message}`);
        }
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          await failPendingOrder(orderNumber, `Invalid response format: ${responseText}`);
          throw new Error('Invalid response from server');
        }
        
        // Update pending order status to completed
        const updateSuccess = await completePendingOrder(orderNumber);
        if (!updateSuccess) {
          console.warn('Failed to update pending order status to completed');
        }
        
        // Send order confirmation SMS and WhatsApp message
        try {
          const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
          
          // Send SMS
          fetch('https://api.dharaniherbbals.com/api/order-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: {
                mobile: cleanPhone,
                orderNumber: orderNumber,
                amount: total
              }
            })
          });
          
          // Send WhatsApp message
          fetch('https://api.dharaniherbbals.com/api/whatsapp/send-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mobile: cleanPhone,
              orderNumber: orderNumber,
              amount: total
            })
          });
        } catch (error) {
          console.error('Error sending notifications:', error);
        }
        
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${orderNumber} placed. You will receive a confirmation SMS shortly.`,
        });
      }
      
      if (isQuickCheckout) {
        clearQuickCheckout();
      } else {
        clearCart();
      }
      navigate('/order-success');
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = "Please try again or contact support.";
      
      if (error.message.includes('Network error')) {
        errorMessage = "Network connection issue. Please check your internet and try again.";
      } else if (error.message.includes('Missing required')) {
        errorMessage = "Please fill in all required fields.";
      } else if (error.message.includes('Payment')) {
        errorMessage = "Payment processing failed. Please try again.";
      } else if (error.message.includes('API Error')) {
        errorMessage = "Server error occurred. Please try again in a few minutes.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (!isQuickCheckout && cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }
  


  // Calculate shipping charges based on state and cart total
  const getShippingInfo = () => {
    let state = '';
    if (selectedShippingAddress && !useManualAddress) {
      const attrs = selectedShippingAddress.attributes || selectedShippingAddress;
      state = attrs.state || '';
    } else {
      state = formData.shippingState || '';
    }
    
    return calculateShipping({
      cartTotal,
      state,
      ecomSettings
    });
  };

  // Get shipping information (recalculates when address changes)
  const shippingInfo = getShippingInfo();
  const shippingCharges = shippingInfo.charges;
  const total = cartTotal + shippingCharges;
  
  // Get minimum order value based on current shipping state
  const minimumOrderValue = parseFloat(shippingInfo.isTamilNadu ? ecomSettings.minimumOrderValueTamilNadu : ecomSettings.minimumOrderValueOtherState || '0');
  const isMinimumOrderMet = minimumOrderValue === 0 || total >= minimumOrderValue;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 py-4 md:py-8">
        <div className="max-w-7xl mx-auto overflow-hidden">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Checkout
            </h1>
            <p className="text-gray-600 text-lg">
              Complete your order securely
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <User className="w-5 h-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          className="mt-2 h-12 border-gray-200 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                        <div className="relative mt-2">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="pl-12 h-12 border-gray-200 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="pl-12 h-12 border-gray-200 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-green-50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <MapPin className="w-5 h-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    {addresses.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-4 mb-4">
                          <input
                            type="checkbox"
                            id="useManualAddress"
                            checked={useManualAddress}
                            onChange={(e) => setUseManualAddress(e.target.checked)}
                            className="w-4 h-4 text-green-600"
                          />
                          <label htmlFor="useManualAddress" className="text-sm font-medium text-gray-700">
                            Enter address manually
                          </label>
                        </div>
                        
                        {!useManualAddress && (
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">Select Shipping Address</Label>
                            {addresses.map((address) => {
                              const attrs = address.attributes || address;
                              return (
                                <div key={address.id} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  selectedShippingAddress?.id === address.id 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-gray-200 hover:border-green-300'
                                }`}
                                onClick={() => setSelectedShippingAddress(address)}
                                >
                                  <div className="flex items-start gap-3">
                                    <input
                                      type="radio"
                                      name="shippingAddress"
                                      checked={selectedShippingAddress?.id === address.id}
                                      onChange={() => setSelectedShippingAddress(address)}
                                      className="mt-1 w-4 h-4 text-green-600"
                                    />
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-800">{attrs.fullName}</h4>
                                      <p className="text-sm text-gray-600">{attrs.address}</p>
                                      <p className="text-sm text-gray-600">{attrs.city}, {attrs.state} - {attrs.pincode}</p>
                                      <p className="text-sm text-gray-500">Phone: {attrs.phone}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {(useManualAddress || addresses.length === 0) && (
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="shippingAddress" className="text-sm font-medium text-gray-700">Street Address</Label>
                          <Textarea
                            id="shippingAddress"
                            name="shippingAddress"
                            value={formData.shippingAddress}
                            onChange={handleInputChange}
                            required
                            className="mt-2 border-gray-200 focus:border-green-500 min-h-[100px]"
                            placeholder="Enter your complete address"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="shippingCity" className="text-sm font-medium text-gray-700">City</Label>
                            <Input
                              id="shippingCity"
                              name="shippingCity"
                              value={formData.shippingCity}
                              onChange={handleInputChange}
                              required
                              className="mt-2 h-12 border-gray-200 focus:border-green-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="shippingState" className="text-sm font-medium text-gray-700">State</Label>
                            <Input
                              id="shippingState"
                              name="shippingState"
                              value={formData.shippingState}
                              onChange={handleInputChange}
                              required
                              className="mt-2 h-12 border-gray-200 focus:border-green-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="shippingPincode" className="text-sm font-medium text-gray-700">Pincode</Label>
                            <Input
                              id="shippingPincode"
                              name="shippingPincode"
                              value={formData.shippingPincode}
                              onChange={handleInputChange}
                              required
                              className="mt-2 h-12 border-gray-200 focus:border-green-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Billing Address */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <CreditCard className="w-5 h-5" />
                      Billing Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <input
                        type="checkbox"
                        id="differentBillingAddress"
                        checked={differentBillingAddress}
                        onChange={(e) => setDifferentBillingAddress(e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="differentBillingAddress" className="text-sm font-medium text-gray-700">
                        Use different billing address
                      </label>
                    </div>
                    
                    {differentBillingAddress && (
                      <div>
                        {addresses.length > 0 && (
                          <div className="space-y-3 mb-6">
                            <Label className="text-sm font-medium text-gray-700">Select Billing Address</Label>
                            {addresses.filter(addr => {
                              const attrs = addr.attributes || addr;
                              return attrs.type === 'billing';
                            }).map((address) => {
                              const attrs = address.attributes || address;
                              return (
                                <div key={address.id} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  selectedBillingAddress?.id === address.id 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-blue-300'
                                }`}
                                onClick={() => setSelectedBillingAddress(address)}
                                >
                                  <div className="flex items-start gap-3">
                                    <input
                                      type="radio"
                                      name="billingAddress"
                                      checked={selectedBillingAddress?.id === address.id}
                                      onChange={() => setSelectedBillingAddress(address)}
                                      className="mt-1 w-4 h-4 text-blue-600"
                                    />
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-800">{attrs.fullName}</h4>
                                      <p className="text-sm text-gray-600">{attrs.address}</p>
                                      <p className="text-sm text-gray-600">{attrs.city}, {attrs.state} - {attrs.pincode}</p>
                                      <p className="text-sm text-gray-500">Phone: {attrs.phone}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <div className="mt-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelectedBillingAddress(null)}
                                className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Enter billing address manually
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {(!selectedBillingAddress || addresses.length === 0) && (
                          <div className="space-y-6">
                            <div>
                              <Label htmlFor="billingAddress" className="text-sm font-medium text-gray-700">Street Address</Label>
                              <Textarea
                                id="billingAddress"
                                name="billingAddress"
                                value={formData.billingAddress}
                                onChange={handleInputChange}
                                required
                                className="mt-2 border-gray-200 focus:border-blue-500 min-h-[100px]"
                                placeholder="Enter billing address"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="billingCity" className="text-sm font-medium text-gray-700">City</Label>
                                <Input
                                  id="billingCity"
                                  name="billingCity"
                                  value={formData.billingCity}
                                  onChange={handleInputChange}
                                  required
                                  className="mt-2 h-12 border-gray-200 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <Label htmlFor="billingState" className="text-sm font-medium text-gray-700">State</Label>
                                <Input
                                  id="billingState"
                                  name="billingState"
                                  value={formData.billingState}
                                  onChange={handleInputChange}
                                  required
                                  className="mt-2 h-12 border-gray-200 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <Label htmlFor="billingPincode" className="text-sm font-medium text-gray-700">Pincode</Label>
                                <Input
                                  id="billingPincode"
                                  name="billingPincode"
                                  value={formData.billingPincode}
                                  onChange={handleInputChange}
                                  required
                                  className="mt-2 h-12 border-gray-200 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <CreditCard className="w-5 h-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    {isLoadingSettings ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                        <span className="ml-2 text-gray-600">Loading payment options...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ecomSettings.onlinePay && (
                          <div className="flex items-center space-x-3 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                            <input
                              type="radio"
                              id="online"
                              name="paymentMethod"
                              value="online"
                              checked={formData.paymentMethod === 'online'}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600"
                            />
                            <label htmlFor="online" className="flex-1 cursor-pointer">
                              <div className="font-semibold text-blue-800">Online Payment</div>
                              <div className="text-sm text-blue-600">UPI, Cards, Net Banking via Razorpay</div>
                            </label>
                          </div>
                        )}
                        
                        {ecomSettings.cod && (
                          <div className="flex items-center space-x-3 p-4 border-2 border-green-200 rounded-lg bg-green-50">
                            <input
                              type="radio"
                              id="cod"
                              name="paymentMethod"
                              value="cod"
                              checked={formData.paymentMethod === 'cod'}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-green-600"
                            />
                            <label htmlFor="cod" className="flex-1 cursor-pointer">
                              <div className="font-semibold text-green-800">Cash on Delivery</div>
                              <div className="text-sm text-green-600">Pay when you receive your order</div>
                            </label>
                          </div>
                        )}
                        
                        {!ecomSettings.cod && !ecomSettings.onlinePay && (
                          <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50 text-center">
                            <p className="text-red-600">No payment methods are currently available. Please try again later.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Notes */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 md:p-6">
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="mt-2 border-gray-200 focus:border-gray-400"
                      placeholder="Any special instructions for delivery..."
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="order-last lg:order-last">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm lg:sticky lg:top-8">
                  <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-t-lg">
                    <CardTitle className="text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 md:p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 md:w-12 md:h-12 object-contain bg-white rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/50x50?text=Product';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-xs md:text-sm truncate ${isTamil ? 'tamil-text' : ''}`}>
                              {isTamil && item.tamil ? item.tamil : item.name}
                            </h4>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-semibold text-xs md:text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-lg">
                        <span>Subtotal</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      {/* Minimum Order Value Warning */}
                      {minimumOrderValue > 0 && total < minimumOrderValue && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">
                            Minimum order value: {formatPrice(minimumOrderValue)}
                          </p>
                          <p className="text-xs text-red-500 mt-1">
                            Add {formatPrice(minimumOrderValue - total)} more to place order
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between text-lg">
                        <span>Shipping</span>
                        <span className={`font-semibold ${shippingInfo.isFree ? 'text-green-600' : ''}`}>
                          {shippingInfo.isFree ? 'Free' : formatPrice(shippingCharges)}
                        </span>
                      </div>
                      {!shippingInfo.isFree && shippingInfo.remainingForFreeShipping > 0 && (
                        <div className="text-sm text-green-600 mt-1">
                          Add {formatPrice(shippingInfo.remainingForFreeShipping)} more for free shipping!
                        </div>
                      )}
                      <div className="flex justify-between text-lg text-gray-500">
                        <span>Tax</span>
                        <span>Inclusive</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-xl font-bold">
                          <span>Total</span>
                          <span className="text-green-600">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Place Order Button - Only show if at least one payment method is active */}
                    {(ecomSettings.cod || ecomSettings.onlinePay) && (
                      <Button
                        type="submit"
                        disabled={isLoading || !isMinimumOrderMet}
                        className={`w-full shadow-lg py-2 md:py-3 text-base md:text-lg font-semibold ${
                          isMinimumOrderMet 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing Order...
                          </>
                        ) : !isMinimumOrderMet ? (
                          <>
                            Minimum Order Not Met
                          </>
                        ) : (
                          <>
                            Place Order
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    )}

                    {/* Security Badge */}
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-green-800 font-medium">
                          Secure & Safe Checkout
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;