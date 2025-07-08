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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { getAddresses } from '@/services/profile';
import { generateOrderNumber, generateInvoiceNumber, initiatePayment, OrderData } from '@/services/payment';
import { CreditCard, MapPin, User, Phone, Mail, ShieldCheck, ArrowRight, Package, Plus } from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
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
    paymentMethod: 'cod',
    
    // Additional
    notes: ''
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
      return;
    }
    if (user?.id) {
      loadAddresses();
    }
  }, [user, isAuthenticated, navigate]);
  
  const loadAddresses = async () => {
    if (user?.id) {
      const userAddresses = await getAddresses(user.id);
      setAddresses(userAddresses);
      if (userAddresses.length > 0) {
        setSelectedShippingAddress(userAddresses[0]);
      }
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

    try {
      // Generate order number and invoice number
      const orderNumber = await generateOrderNumber();
      const invoiceNumber = await generateInvoiceNumber();
      console.log('Using order number:', orderNumber, 'Invoice:', invoiceNumber);
      
      // Get address info
      let shippingAddr = '';
      if (selectedShippingAddress && !useManualAddress) {
        const attrs = selectedShippingAddress.attributes || selectedShippingAddress;
        shippingAddr = `${attrs.address}, ${attrs.city}, ${attrs.state} - ${attrs.pincode}`;
      } else {
        shippingAddr = `${formData.shippingAddress}, ${formData.shippingCity}, ${formData.shippingState} - ${formData.shippingPincode}`;
      }

      if (formData.paymentMethod === 'online') {
        // Prepare order data for Razorpay
        const orderData: OrderData = {
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          total: total,
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

        console.log('Initiating payment with data:', orderData);
        
        // Initiate Razorpay payment
        await initiatePayment(orderData, orderNumber, invoiceNumber);
        
        toast({
          title: "Payment Successful!",
          description: `Order #${orderNumber} placed successfully. You will receive a confirmation email shortly.`,
        });
      } else {
        // COD Order - Store directly
        const orderPayload = {
          data: {
            ordernum: orderNumber,
            invoicenum: invoiceNumber,
            totalValue: total,
            total: total,
            customername: formData.fullName,
            phoneNum: formData.phone,
            email: formData.email,
            communication: 'website',
            payment: 'COD',
            shippingAddress: shippingAddr,
            billingAddress: shippingAddr,
            Name: cartItems.map(item => item.name).join(' | '),
            price: cartItems.map(item => `${item.name}: ${formatPrice(item.price)} x ${item.quantity}`).join(' | '),
            remarks: formData.notes || 'No special notes',
            quantity: String(cartItems.reduce((sum, item) => sum + item.quantity, 0))
          }
        };

        // Validate required fields
        if (!formData.fullName || !formData.email || !formData.phone || !shippingAddr) {
          throw new Error('Missing required customer information');
        }
        
        console.log('Placing COD order with payload:', JSON.stringify(orderPayload, null, 2));
        
        const response = await fetch('https://api.dharaniherbbals.com/api/orders', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(orderPayload)
        });

        const responseText = await response.text();
        console.log('API Response:', response.status, responseText);
        
        if (!response.ok) {
          console.error('COD order error response:', responseText);
          throw new Error(`Failed to place order: ${response.status} - ${responseText}`);
        }
        
        const result = JSON.parse(responseText);
        console.log('COD order placed successfully:', result);
        
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${orderNumber} placed. You will receive a confirmation call shortly.`,
        });
      }
      
      clearCart();
      navigate('/order-success');
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }
  
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const tax = cartTotal * 0.1;
  const total = cartTotal + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-7xl mx-auto">
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
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Customer Information */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <User className="w-5 h-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8">
                    <div className="grid md:grid-cols-2 gap-6">
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
                  <CardContent className="p-6 md:p-8">
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
                        <div className="grid md:grid-cols-3 gap-6">
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
                  <CardContent className="p-6 md:p-8">
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
                            <div className="grid md:grid-cols-3 gap-6">
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
                  <CardContent className="p-6 md:p-8">
                    <div className="space-y-4">
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
                    </div>
                  </CardContent>
                </Card>

                {/* Order Notes */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 md:p-8">
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
              <div>
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm sticky top-8">
                  <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-t-lg">
                    <CardTitle className="text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8">
                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-contain bg-white rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/50x50?text=Product';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-sm truncate ${isTamil ? 'tamil-text' : ''}`}>
                              {item.name}
                            </h4>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-semibold text-sm">
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
                      <div className="flex justify-between text-lg">
                        <span>Shipping</span>
                        <span className="text-green-600 font-semibold">Free</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span>Tax (10%)</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-xl font-bold">
                          <span>Total</span>
                          <span className="text-green-600">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg py-3 text-lg font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing Order...
                        </>
                      ) : (
                        <>
                          Place Order
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

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