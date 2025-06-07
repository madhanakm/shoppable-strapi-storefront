
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
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Shipping & Delivery Policy</h1>
          <p className="text-muted-foreground mb-12">
            We're committed to getting your order to you quickly and safely. Here's everything you need to know about our shipping process.
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
                  Enjoy free standard shipping on all orders over $50. No minimum purchase required for express shipping.
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
                  Orders placed before 2 PM are processed the same day. Weekend orders are processed on the next business day.
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
                  We ship worldwide! Delivery times and costs vary by location. Check our shipping calculator at checkout.
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
                  Track your order in real-time with our tracking system. You'll receive updates via email and SMS.
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
                      <td className="border border-border p-3">Standard Shipping</td>
                      <td className="border border-border p-3">5-7 business days</td>
                      <td className="border border-border p-3">Free on orders $50+, otherwise $5.99</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Express Shipping</td>
                      <td className="border border-border p-3">2-3 business days</td>
                      <td className="border border-border p-3">$12.99</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Overnight Shipping</td>
                      <td className="border border-border p-3">1 business day</td>
                      <td className="border border-border p-3">$24.99</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">International</td>
                      <td className="border border-border p-3">7-21 business days</td>
                      <td className="border border-border p-3">Varies by destination</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Order Processing</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Orders are processed Monday through Friday, excluding holidays</li>
                <li>Processing time is 1-2 business days for most items</li>
                <li>Custom or personalized items may require additional processing time</li>
                <li>You'll receive a confirmation email once your order ships</li>
                <li>Tracking information will be provided within 24 hours of shipment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">International Shipping</h2>
              <p className="text-muted-foreground mb-4">
                We're happy to ship internationally to most countries. Please note:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>International customers are responsible for customs duties and taxes</li>
                <li>Delivery times may vary due to customs processing</li>
                <li>Some items may be restricted in certain countries</li>
                <li>International orders cannot be expedited</li>
                <li>We use reliable international carriers including DHL, FedEx, and UPS</li>
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
                For any shipping-related questions, please contact our customer service team:
                <br />
                Email: shipping@shophub.com
                <br />
                Phone: +1 (555) 123-4567
                <br />
                Live Chat: Available 9 AM - 6 PM EST, Monday - Friday
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
