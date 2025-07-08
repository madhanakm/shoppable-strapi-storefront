
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Clock, MapPin, Package } from 'lucide-react';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Shipping Policy</h1>
          <p className="text-muted-foreground mb-12">
            At Dharani Herbbals, we are committed to delivering your herbal and wellness products safely and efficiently. Please review our shipping policy for important information about delivery times, costs, and procedures.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Free Shipping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Free shipping on orders above ₹500. Standard shipping charges apply for orders below ₹500.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Fast Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Orders are typically processed within 1-2 business days after payment confirmation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Global Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We deliver across India. Delivery to remote areas may take additional 2-3 days.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track your package status on our website or through the courier partner's tracking system.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Shipping Methods & Timeframes</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-3 text-left">Shipping Method</th>
                      <th className="border border-border p-3 text-left">Delivery Time</th>
                      <th className="border border-border p-3 text-left">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-3">Standard Delivery</td>
                      <td className="border border-border p-3">5-7 business days</td>
                      <td className="border border-border p-3">Free on orders ₹500+, otherwise ₹50</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Express Delivery</td>
                      <td className="border border-border p-3">2-3 business days</td>
                      <td className="border border-border p-3">₹100 additional</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Same Day Delivery</td>
                      <td className="border border-border p-3">Same day (select cities)</td>
                      <td className="border border-border p-3">₹150</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Cash on Delivery</td>
                      <td className="border border-border p-3">5-7 business days</td>
                      <td className="border border-border p-3">₹30 additional COD charges</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Order Processing</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Orders are processed Monday through Saturday, excluding holidays</li>
                <li>Processing time is 1-2 business days for most items</li>
                <li>Processing may be longer during peak seasons or festivals</li>
                <li>You'll receive SMS and email confirmation once your order ships</li>
                <li>Tracking information will be provided within 24 hours of shipment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Delivery Guidelines</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Please ensure someone is available to receive the package</li>
                <li>Valid ID proof may be required for delivery</li>
                <li>Packages will be delivered to the address provided during checkout</li>
                <li>We are not responsible for delays due to incorrect address or unavailability</li>
                <li>Our herbal products are carefully packaged to maintain quality and potency</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Delivery Issues</h2>
              <p className="text-muted-foreground mb-4">
                If you experience any issues with your delivery:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Contact us within 48 hours of expected delivery date</li>
                <li>We'll work with our shipping partners to locate your package</li>
                <li>Lost packages will be replaced or refunded</li>
                <li>Damaged items can be returned for exchange or refund</li>
                <li>We require photo evidence for damaged package claims</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                For shipping-related questions or issues, please contact us at:
                <br />Email: info@dharaniherbbals.in
                <br />Phone: +91 97881 22001
                <br />Business Hours: Mon - Sat: 9:00 AM - 7:00 PM
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingPolicy;
