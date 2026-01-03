import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';

const OrderSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <SEOHead 
        title="Order Successful"
        description="Your order has been placed successfully! Thank you for shopping with Dharani Herbbals."
        url="/order-success"
      />
      <Header />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Order Placed Successfully!
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Thank you for your order. We'll send you a confirmation email shortly with your order details and tracking information.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">What's Next?</span>
                </div>
                <p className="text-green-700 text-sm">
                  Our team will process your order within 24 hours. You'll receive updates via SMS and email.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                    <Home className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                    View Orders
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess;