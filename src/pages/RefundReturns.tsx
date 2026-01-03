import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const RefundReturns = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      
      <section className="bg-gradient-to-r from-primary to-green-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Refund & Returns Policy</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Your satisfaction is our priority. Learn about our refund and return policies.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="prose prose-lg max-w-none space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Refund & Returns Policy</h2>
              
              <section>
                <p className="text-gray-600 leading-relaxed mb-6">
                  At Dharani Herbbals, we want you to be completely satisfied with your purchase. If you are not satisfied with your order, we offer a comprehensive return and refund policy to ensure your peace of mind.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Return Eligibility</h3>
                <ul className="list-disc pl-6 text-gray-600 leading-relaxed mb-4">
                  <li>Items must be returned within 7 days of delivery</li>
                  <li>Products must be in original, unopened condition</li>
                  <li>Original packaging and labels must be intact</li>
                  <li>Prescription items and personalized products cannot be returned</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Return Process</h3>
                <ol className="list-decimal pl-6 text-gray-600 leading-relaxed mb-4">
                  <li>Contact our customer service team at info@dharaniherbbals.in or +91 97881 22001</li>
                  <li>Provide your order number and reason for return</li>
                  <li>Receive return authorization and shipping instructions</li>
                  <li>Package items securely and ship to our return address</li>
                  <li>Refund will be processed within 5-7 business days after we receive the returned items</li>
                </ol>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Refund Policy</h3>
                <ul className="list-disc pl-6 text-gray-600 leading-relaxed mb-4">
                  <li>Refunds will be issued to the original payment method</li>
                  <li>Shipping charges are non-refundable unless the return is due to our error</li>
                  <li>Return shipping costs are the responsibility of the customer</li>
                  <li>Processing time for refunds may vary depending on your payment provider</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Exchanges</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We currently do not offer direct exchanges. If you need a different product, please return the original item for a refund and place a new order for the desired product.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Damaged or Defective Items</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you receive a damaged or defective item, please contact us immediately. We will provide a prepaid return label and issue a full refund or replacement at no additional cost to you.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Contact Us</h3>
                <p className="text-gray-600 leading-relaxed">
                  For any questions about returns or refunds, please contact our customer service team:
                  <br />Email: info@dharaniherbbals.in
                  <br />Phone: +91 97881 22001
                  <br />Business Hours: Mon - Sat: 9:00 AM - 7:00 PM
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RefundReturns;