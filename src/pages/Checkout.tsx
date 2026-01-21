import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
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
import { calculateShipping, calculateShippingSync } from '@/lib/shipping';
import { getStateShippingRates } from '@/services/state-shipping';
import { deleteAddress } from '@/services/profile';
import { CreditCard, MapPin, User, Phone, Mail, ShieldCheck, ArrowRight, Package, Plus, Trash2 } from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import { recoverPendingPayments } from '@/services/payment-recovery';
import { canPlaceCreditOrder, placeCreditOrder } from '@/services/credit-orders';
import { UserType } from '@/types/strapi';
import { useOrderFulfillment } from '@/hooks/useOrderFulfillment';
import { getEcomUserByPhone, EcomUser } from '@/services/ecom-users';

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
  const { language, translate } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const { processOrder: fulfillOrder } = useOrderFulfillment();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);
  const [showPaymentWarning, setShowPaymentWarning] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [differentBillingAddress, setDifferentBillingAddress] = useState(false);
  const [useManualAddress, setUseManualAddress] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [ecomSettings, setEcomSettings] = useState<EcommerceSettings>({ cod: true, onlinePay: true, creditPayment: true, minimumOrderValueTamilNadu: '0', minimumOrderValueOtherState: '0', tamilNaduShipping: '50', otherStateShipping: '150', tamilNaduFreeShipping: '750', otherStateFreeShipping: '1000' });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [ecomUser, setEcomUser] = useState<EcomUser | null>(null);
  const [stateRates, setStateRates] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({ charges: 0, isFree: false, isTamilNadu: false, freeShippingThreshold: 0, remainingForFreeShipping: 0 });
  
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
    loadEcomUser();
  }, [user?.id, isAuthenticated, navigate, loading, currentUserId]);
  
  // Add payment warning when user tries to close tab during payment
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isPaymentInProgress) {
        e.preventDefault();
        e.returnValue = 'Payment is in progress. Closing this tab may cause your order to fail. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPaymentInProgress]);
  
  // Fetch ecommerce settings and state rates
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const [settings, rates] = await Promise.all([
          getEcommerceSettings(),
          getStateShippingRates()
        ]);

        setEcomSettings(settings);
        setStateRates(rates);
        
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
  
  // Calculate shipping charges when address or cart changes
  useEffect(() => {
    const updateShipping = async () => {
      let state = '';
      if (selectedShippingAddress && !useManualAddress) {
        const attrs = selectedShippingAddress.attributes || selectedShippingAddress;
        state = attrs.state || '';
      } else {
        state = formData.shippingState || '';
      }
      
      if (state && stateRates.length > 0) {
        const info = await calculateShipping({
          cartTotal,
          state,
          ecomSettings,
          stateRates
        });
        setShippingInfo(info);
      } else {
        // Fallback to sync calculation
        const info = calculateShippingSync({
          cartTotal,
          state,
          ecomSettings
        });
        setShippingInfo(info);
      }
    };
    
    updateShipping();
  }, [cartTotal, selectedShippingAddress, useManualAddress, formData.shippingState, ecomSettings, stateRates]);
  
  const loadEcomUser = async () => {
    if (user?.phone) {
      try {
        const response = await getEcomUserByPhone(user.phone);
        if (response.data && response.data.length > 0) {
          setEcomUser(response.data[0].attributes);
        }
      } catch (error) {
        console.error('Failed to load ecom user:', error);
      }
    }
  };
  
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
    
    // Get current state for minimum order value calculation
    const currentState = selectedShippingAddress && !useManualAddress 
      ? (selectedShippingAddress.attributes || selectedShippingAddress).state || ''
      : formData.shippingState || '';
    
    // Determine if current state is Tamil Nadu for minimum order value
    const normalizedState = currentState.toLowerCase().replace(/\s+/g, '');
    const isCurrentStateTamilNadu = normalizedState.includes('tamilnadu') || 
                                   normalizedState === 'tn' ||
                                   (normalizedState.includes('tamil') && normalizedState.includes('nadu'));
    
    // Get minimum order value from state shipping rates
    const stateRate = stateRates.find(rate => {
      const normalizedRateName = rate.stateName.toLowerCase().replace(/\s+/g, '');
      return normalizedRateName === normalizedState || rate.stateCode === currentState.toUpperCase();
    });
    const minimumOrderValue = parseFloat(stateRate?.minimumOrderValue || '0');
    
    // Validate minimum order value (check against cart subtotal, not including shipping)
    // Skip validation if minimumOrderValue is -1 (disabled)
    if (minimumOrderValue > 0 && minimumOrderValue !== -1 && cartTotal < minimumOrderValue) {
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
            skuid: item.skuid || item.id,
            productId: item.originalProductId || item.id // Always base product ID
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
            skuid: item.skuid || item.id,
            productId: item.originalProductId || item.id
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
          publishedAt: new Date().toISOString()
        };

        // Initiating payment
        try {
          setIsPaymentInProgress(true);
          setShowPaymentWarning(true);
          // Generate invoice number only for successful payment
          const invoiceNumber = await generateInvoiceNumber();
          // Initiate Razorpay payment (handles order creation and completion internally)
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
        } finally {
          setIsPaymentInProgress(false);
          setShowPaymentWarning(false);
        }
      } else if (formData.paymentMethod === 'credit') {
        // Credit Order - Direct order creation
        
        // Validate required fields for credit orders
        if (!formData.fullName || !formData.email || !formData.phone || !shippingAddr) {
          throw new Error('Missing required customer information for credit order');
        }
        
        // Validate credit limit
        const creditLimit = parseFloat(ecomUser?.creditLimit || '0');
        if (creditLimit > 0 && total > creditLimit) {
          throw new Error(`Order amount ₹${total} exceeds your credit limit of ₹${creditLimit}`);
        }
        
        // Use proper order number and generate invoice number
        let currentOrderNumber = orderNumber;
        let invoiceNumber = await generateInvoiceNumber();
        
        const orderPayload = {
          data: {
            customername: formData.fullName,
            total: Number(total),
            totalValue: Number(total),
            payment: 'Credit',
            ordernum: currentOrderNumber,
            invoicenum: invoiceNumber,
            phoneNum: formData.phone,
            email: formData.email,
            communication: 'website',
            shippingAddress: shippingAddr,
            billingAddress: shippingAddr,
            Name: cartItems.map(item => item.name.replace(/\t/g, '').trim()).join(' | '),
            price: cartItems.map(item => `${item.name.replace(/\t/g, '').trim()}: ${formatPrice(item.price)} x ${item.quantity}`).join(' | '),
            skuid: cartItems.map(item => item.skuid || item.id).join(' | '),
            prodid: cartItems.map(item => item.originalProductId || item.id).join(' | '),
            quantity: String(cartItems.reduce((sum, item) => sum + item.quantity, 0)),
            remarks: formData.notes || `Credit order by ${ecomUser?.userType || 'user'}`,
            shippingRate: Number(shippingCharges),
            publishedAt: new Date().toISOString()
          }
        };

        console.log('Credit order payload:', JSON.stringify(orderPayload, null, 2));
        
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
            console.error('Credit order API error:', response.status, responseText);
            console.error('Request payload was:', JSON.stringify(orderPayload, null, 2));
            throw new Error(`Failed to place credit order: ${response.status} - ${responseText}`);
          }
        } catch (fetchError) {
          console.error('Network error during credit order:', fetchError);
          throw new Error(`Network error while placing credit order: ${fetchError.message}`);
        }
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Invalid response format:', responseText);
          throw new Error('Invalid response from server');
        }

        // Process order fulfillment after successful order creation
        try {
          await fulfillOrder(result);
        } catch (fulfillmentError) {
          console.error('Order fulfillment failed:', fulfillmentError);
          // Don't fail the entire order if fulfillment fails
        }
        
        // Send order confirmation SMS and WhatsApp message for credit orders
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
          title: "Credit Order Placed Successfully!",
          description: `Order #${orderNumber} placed on credit. You will receive confirmation shortly.`,
        });
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
            skuid: item.skuid || item.id,
            productId: item.originalProductId || item.id
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
        let invoiceNumber = await generateInvoiceNumber();
        let currentOrderNumber = orderNumber;
        
        // Check if order number already exists and generate new one if needed
        try {
          const existingOrderCheck = await fetch(`https://api.dharaniherbbals.com/api/orders?filters[ordernum][$eq]=${encodeURIComponent(currentOrderNumber)}`);
          if (existingOrderCheck.ok) {
            const existingData = await existingOrderCheck.json();
            if (existingData.data && existingData.data.length > 0) {
              currentOrderNumber = await generateOrderNumber();
              invoiceNumber = await generateInvoiceNumber();
            }
          }
        } catch (error) {
          console.warn('Could not check for existing COD order:', error);
        }
        
        const orderPayload = {
          data: {
            ordernum: currentOrderNumber,
            invoicenum: invoiceNumber,
            totalValue: total,
            total: total,
            shippingCharges: shippingCharges,
            shippingRate: shippingCharges,
            customername: formData.fullName,
            phoneNum: formData.phone,
            email: formData.email,
            communication: 'website',
            payment: 'COD',
            shippingAddress: shippingAddr,
            billingAddress: shippingAddr,
            Name: cartItems.map(item => item.name.replace(/[\t\r\n\f\v]/g, '').trim()).join(' | '),
            price: cartItems.map(item => `${item.name.replace(/[\t\r\n\f\v]/g, '').trim()}: ${item.price} x ${item.quantity}`).join(' | '),
            skuid: cartItems.map(item => item.skuid || item.id).join(' | '),
            prodid: cartItems.map(item => item.originalProductId || item.id).join(' | '),
            remarks: formData.notes || 'No special notes',
            notes: `COD Order - ${currentOrderNumber}`,
            quantity: String(cartItems.reduce((sum, item) => sum + item.quantity, 0)),
            publishedAt: new Date().toISOString()
          }
        };

        // Validate required fields
        if (!formData.fullName || !formData.email || !formData.phone || !shippingAddr) {
          await failPendingOrder(orderNumber, 'Missing required customer information');
          throw new Error('Missing required customer information');
        }
        
        // Invoice number already generated above
        
        // Debug product names
        console.log('Raw product names:', cartItems.map(item => ({ name: item.name, cleaned: item.name.replace(/[\t\r\n\f\v]/g, '').trim() })));
        
        console.log('COD order payload:', JSON.stringify(orderPayload, null, 2));
        
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
        
        // Process order fulfillment after successful COD order creation
        try {
          await fulfillOrder(result);
        } catch (fulfillmentError) {
          console.error('Order fulfillment failed:', fulfillmentError);
          // Don't fail the entire order if fulfillment fails
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
  


  const shippingCharges = shippingInfo.charges;
  const total = cartTotal + shippingCharges;
  
  // Get current state for minimum order value calculation
  const currentState = selectedShippingAddress && !useManualAddress 
    ? (selectedShippingAddress.attributes || selectedShippingAddress).state || ''
    : formData.shippingState || '';
  
  // Determine if current state is Tamil Nadu for minimum order value
  const normalizedState = currentState.toLowerCase().replace(/\s+/g, '');
  const isCurrentStateTamilNadu = normalizedState.includes('tamilnadu') || 
                                 normalizedState === 'tn' ||
                                 (normalizedState.includes('tamil') && normalizedState.includes('nadu'));
  
  // Get minimum order value from state shipping rates
  const stateRate = stateRates.find(rate => {
    const normalizedRateName = rate.stateName.toLowerCase().replace(/\s+/g, '');
    return normalizedRateName === normalizedState || rate.stateCode === currentState.toUpperCase();
  });
  const minimumOrderValue = parseFloat(stateRate?.minimumOrderValue || '0');
  const isMinimumOrderMet = minimumOrderValue === 0 || minimumOrderValue === -1 || cartTotal >= minimumOrderValue;
  


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-x-hidden">
      <SEOHead 
        title="Checkout"
        description="Complete your order securely. Multiple payment options including COD and online payment with SSL encryption."
        url="/checkout"
      />
      <Header />
      <main className="w-full px-2 py-4 md:py-8 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-12 px-2">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-3 md:mb-4">
              <Package className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className={`text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 md:mb-4 ${isTamil ? 'tamil-text' : ''}`}>
              {translate('checkout.title')}
            </h1>
            <p className={`text-sm md:text-lg text-gray-600 ${isTamil ? 'tamil-text' : ''}`}>
              {translate('checkout.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full overflow-x-hidden">
            <div className="w-full flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-8">
              {/* Checkout Form */}
              <div className="w-full lg:col-span-2 space-y-4 md:space-y-6 overflow-x-hidden">
                {/* Customer Information */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm w-full overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-t-lg p-3 md:p-6">
                    <CardTitle className={`flex items-center gap-2 text-lg md:text-xl ${isTamil ? 'tamil-text' : ''}`}>
                      <User className="w-4 h-4 md:w-5 md:h-5" />
                      {translate('checkout.customerInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div className="w-full">
                        <Label htmlFor="fullName" className={`text-xs md:text-sm font-medium text-gray-700 ${isTamil ? 'tamil-text' : ''}`}>{translate('checkout.fullName')}</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          className="mt-1 md:mt-2 h-10 md:h-12 border-gray-200 focus:border-blue-500 w-full"
                        />
                      </div>
                      <div className="w-full">
                        <Label htmlFor="phone" className={`text-xs md:text-sm font-medium text-gray-700 ${isTamil ? 'tamil-text' : ''}`}>{translate('checkout.phone')}</Label>
                        <div className="relative mt-1 md:mt-2">
                          <Phone className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="pl-8 md:pl-12 h-10 md:h-12 border-gray-200 focus:border-blue-500 w-full"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-6 w-full">
                      <Label htmlFor="email" className={`text-xs md:text-sm font-medium text-gray-700 ${isTamil ? 'tamil-text' : ''}`}>{translate('checkout.email')}</Label>
                      <div className="relative mt-1 md:mt-2">
                        <Mail className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="pl-8 md:pl-12 h-10 md:h-12 border-gray-200 focus:border-blue-500 w-full"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-green-50 rounded-t-lg">
                    <CardTitle className={`flex items-center gap-2 text-xl ${isTamil ? 'tamil-text' : ''}`}>
                      <MapPin className="w-5 h-5" />
                      {translate('checkout.shippingAddress')}
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
                      <label htmlFor="useManualAddress" className={`text-sm font-medium text-gray-700 ${isTamil ? 'tamil-text' : ''}`}>
                        {translate('checkout.enterManually')}
                      </label>
                        </div>
                        
                        {!useManualAddress && (
                          <div className="space-y-3">
                            <Label className={`text-sm font-medium text-gray-700 ${isTamil ? 'tamil-text' : ''}`}>{translate('checkout.selectShippingAddress')}</Label>
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
                                    <button
                                      type="button"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Delete this address?')) {
                                          try {
                                            const success = await deleteAddress(address.id);
                                            if (success) {
                                              loadAddresses();
                                              toast({ title: "Address deleted successfully" });
                                            } else {
                                              toast({ title: "Failed to delete address", variant: "destructive" });
                                            }
                                          } catch (error) {
                                            toast({ title: "Failed to delete address", variant: "destructive" });
                                          }
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full min-w-[32px] h-8 flex items-center justify-center"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
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
                            <select
                              id="shippingState"
                              name="shippingState"
                              value={formData.shippingState}
                              onChange={handleInputChange}
                              required
                              className="mt-2 h-12 border-gray-200 focus:border-green-500 w-full rounded-md border px-3 py-2"
                            >
                              <option value="">Select State</option>
                              {stateRates.map(state => (
                                <option key={state.stateCode} value={state.stateName}>
                                  {state.stateName}
                                </option>
                              ))}
                            </select>
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
                    <CardTitle className={`flex items-center gap-2 text-xl ${isTamil ? 'tamil-text' : ''}`}>
                      <CreditCard className="w-5 h-5" />
                      {translate('checkout.billingAddress')}
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
                      <label htmlFor="differentBillingAddress" className={`text-sm font-medium text-gray-700 ${isTamil ? 'tamil-text' : ''}`}>
                        {translate('checkout.useDifferentBilling')}
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
                                <select
                                  id="billingState"
                                  name="billingState"
                                  value={formData.billingState}
                                  onChange={handleInputChange}
                                  required
                                  className="mt-2 h-12 border-gray-200 focus:border-blue-500 w-full rounded-md border px-3 py-2"
                                >
                                  <option value="">Select State</option>
                                  {stateRates.map(state => (
                                    <option key={state.stateCode} value={state.stateName}>
                                      {state.stateName}
                                    </option>
                                  ))}
                                </select>
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
                    <CardTitle className={`flex items-center gap-2 text-xl ${isTamil ? 'tamil-text' : ''}`}>
                      <CreditCard className="w-5 h-5" />
                      {translate('checkout.paymentMethod')}
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
                              <div className={`font-semibold text-blue-800 ${isTamil ? 'tamil-text' : ''}`}>{translate('checkout.onlinePayment')}</div>
                              <div className={`text-sm text-blue-600 ${isTamil ? 'tamil-text' : ''}`}>{translate('checkout.onlinePaymentDesc')}</div>
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
                              <div className={`font-semibold text-green-800 ${isTamil ? 'tamil-text' : ''}`}>{translate('checkout.cod')}</div>
                              <div className={`text-sm text-green-600 ${isTamil ? 'tamil-text' : ''}`}>{translate('checkout.codDesc')}</div>
                            </label>
                          </div>
                        )}
                        
                        {ecomUser?.userType && ecomUser.userType.toLowerCase() !== 'customer' && ecomUser?.creditPayment && (
                          <div className="flex items-center space-x-3 p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                            <input
                              type="radio"
                              id="credit"
                              name="paymentMethod"
                              value="credit"
                              checked={formData.paymentMethod === 'credit'}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-purple-600"
                            />
                            <label htmlFor="credit" className="flex-1 cursor-pointer">
                              <div className={`font-semibold text-purple-800 ${isTamil ? 'tamil-text' : ''}`}>{translate('checkout.creditPayment')}</div>
                              <div className={`text-sm text-purple-600 ${isTamil ? 'tamil-text' : ''}`}>{translate('checkout.creditPaymentDesc')}</div>
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


              </div>

              {/* Order Summary */}
              <div className="order-last lg:order-last">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm lg:sticky lg:top-8">
                  <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-t-lg">
                    <CardTitle className={`text-xl ${isTamil ? 'tamil-text' : ''}`}>{translate('checkout.orderSummary')}</CardTitle>
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
                        <span className={isTamil ? 'tamil-text' : ''}>{translate('checkout.subtotal')}</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      {/* Minimum Order Value Warning */}
                      {minimumOrderValue > 0 && minimumOrderValue !== -1 && cartTotal < minimumOrderValue && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className={`text-sm text-red-600 ${isTamil ? 'tamil-text' : ''}`}>
                            {translate('checkout.minimumOrderValue')}: {formatPrice(minimumOrderValue)}
                          </p>
                          <p className={`text-xs text-red-500 mt-1 ${isTamil ? 'tamil-text' : ''}`}>
                            {translate('checkout.addMore')} {formatPrice(minimumOrderValue - cartTotal)} {translate('checkout.toPlaceOrder')}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between text-lg">
                        <span className={isTamil ? 'tamil-text' : ''}>{translate('checkout.shipping')}</span>
                        <span className={`font-semibold ${shippingInfo.isFree ? 'text-green-600' : ''}`}>
                          {shippingInfo.isFree ? translate('checkout.free') : formatPrice(shippingCharges)}
                        </span>
                      </div>
                      {!shippingInfo.isFree && shippingInfo.remainingForFreeShipping > 0 && shippingInfo.freeShippingThreshold !== -1 && (
                        <div className={`text-sm text-green-600 mt-1 ${isTamil ? 'tamil-text' : ''}`}>
                          {translate('checkout.addMore')} {formatPrice(shippingInfo.remainingForFreeShipping)} {translate('checkout.forFreeShipping')}!
                        </div>
                      )}
                      <div className="flex justify-between text-lg text-gray-500">
                        <span className={isTamil ? 'tamil-text' : ''}>{translate('checkout.tax')}</span>
                        <span className={isTamil ? 'tamil-text' : ''}>{translate('checkout.inclusive')}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-xl font-bold">
                          <span className={isTamil ? 'tamil-text' : ''}>{translate('checkout.total')}</span>
                          <span className="text-green-600">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Credit Limit Warning */}
                    {formData.paymentMethod === 'credit' && ecomUser?.creditLimit && (
                      (() => {
                        const creditLimit = parseFloat(ecomUser.creditLimit);
                        const isOverLimit = creditLimit > 0 && total > creditLimit;
                        return isOverLimit ? (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                            <p className="text-sm text-red-600 font-medium">
                              Credit limit exceeded!
                            </p>
                            <p className="text-xs text-red-500 mt-1">
                              Order total: {formatPrice(total)} | Credit limit: {formatPrice(creditLimit)}
                            </p>
                            <p className="text-xs text-red-500 mt-1">
                              Contact us for more information
                            </p>
                          </div>
                        ) : null;
                      })()
                    )}

                    {/* Place Order Button - Only show if at least one payment method is active */}
                    {(ecomSettings.cod || ecomSettings.onlinePay || (ecomUser?.userType && ecomUser.userType.toLowerCase() !== 'customer' && ecomUser?.creditPayment)) && (
                      (() => {
                        const creditLimit = parseFloat(ecomUser?.creditLimit || '0');
                        const isCreditOverLimit = formData.paymentMethod === 'credit' && creditLimit > 0 && total > creditLimit;
                        const isDisabled = isLoading || !isMinimumOrderMet || isCreditOverLimit;
                        
                        return (
                          <Button
                            type="submit"
                            disabled={isDisabled}
                            className={`w-full shadow-lg py-2 md:py-3 text-base md:text-lg font-semibold ${
                              !isDisabled 
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
                                {translate('checkout.minimumOrderNotMet')}
                              </>
                            ) : isCreditOverLimit ? (
                              <>
                                Credit Limit Exceeded
                              </>
                            ) : (
                              <>
                                {translate('checkout.placeOrder')}
                                <ArrowRight className="w-5 h-5 ml-2" />
                              </>
                            )}
                          </Button>
                        );
                      })()
                    )}

                    {/* Security Badge */}
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                        <p className={`text-sm text-green-800 font-medium ${isTamil ? 'tamil-text' : ''}`}>
                          {translate('checkout.secureCheckout')}
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
      
      {/* Payment Warning Modal */}
      {showPaymentWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment in Progress
              </h3>
              <p className="text-gray-600 mb-4">
                Please don't close this tab or navigate away. Your payment is being processed.
              </p>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                <span className="ml-2 text-sm text-gray-500">Processing...</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Checkout;