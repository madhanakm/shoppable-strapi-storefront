import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;


  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Header />
        <main className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-8">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Looks like you haven't added any items to your cart yet
            </p>
            <Link to="/products">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg px-8 py-3">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Start Shopping
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
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Shopping Cart
            </h1>
            <p className="text-gray-600 text-lg">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 md:p-8">
                  <div className="space-y-6">
                    {cartItems.map((item, index) => (
                      <div key={item.id} className={`${index !== 0 ? 'border-t pt-6' : ''}`}>
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl shadow-md overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/150x150?text=Product';
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                              <div className="flex-1">
                                <h3 className={`font-bold text-lg md:text-xl text-gray-800 mb-2 ${isTamil ? 'tamil-text' : ''}`}>
                                  {item.name}
                                </h3>
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
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="h-10 w-10 rounded-md hover:bg-white"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                    className="w-16 text-center border-0 bg-transparent font-semibold"
                                    min="1"
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                                    onClick={() => removeFromCart(item.id)}
                                    className="flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Order Summary */}
            <div>
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm sticky top-8">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-semibold text-gray-500">Inclusive</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(cartTotal)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Link to="/checkout" className="block">
                      <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg py-3 text-lg">
                        Proceed to Checkout
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Link to="/products" className="block">
                      <Button variant="outline" className="w-full border-2 border-gray-300 hover:bg-gray-50 py-3">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Security Badge */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 text-center">
                      🔒 Secure checkout with SSL encryption
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;