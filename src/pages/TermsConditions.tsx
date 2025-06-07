
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms & Conditions</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using ShopHub, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do 
                not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p className="text-muted-foreground mb-4">
                Permission is granted to temporarily download one copy of the materials on ShopHub's 
                website for personal, non-commercial transitory viewing only.
              </p>
              <p className="text-muted-foreground mb-4">This license shall automatically terminate if you violate any of these restrictions:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Modify or copy the materials</li>
                <li>Use the materials for commercial purposes or for public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Product Information</h2>
              <p className="text-muted-foreground mb-4">
                We strive to provide accurate product information, but we do not warrant that product 
                descriptions or other content is accurate, complete, reliable, current, or error-free.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Prices are subject to change without notice</li>
                <li>Product availability may vary</li>
                <li>Colors and images may appear differently on different devices</li>
                <li>We reserve the right to limit quantities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Account Terms</h2>
              <p className="text-muted-foreground mb-4">
                When you create an account with us, you must provide accurate and complete information.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You are responsible for safeguarding your password</li>
                <li>You are responsible for all activities under your account</li>
                <li>You must notify us of any unauthorized use</li>
                <li>We reserve the right to suspend or terminate accounts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
              <p className="text-muted-foreground mb-4">
                All payments must be made in full at the time of purchase unless otherwise arranged.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>We accept major credit cards and digital payment methods</li>
                <li>Payment processing is handled by secure third-party providers</li>
                <li>All prices are in USD unless otherwise specified</li>
                <li>Taxes and shipping costs are additional</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Returns and Refunds</h2>
              <p className="text-muted-foreground">
                Please refer to our Return Policy for detailed information about returns, exchanges, 
                and refunds. Generally, items must be returned within 30 days in original condition.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                In no case shall ShopHub or its directors, officers, employees, affiliates, agents, 
                contractors, interns, suppliers, service providers, or licensors be liable for any 
                injury, loss, claim, or any direct, indirect, incidental, punitive, special, or 
                consequential damages of any kind.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
              <p className="text-muted-foreground">
                Questions about the Terms of Service should be sent to us at:
                <br />
                Email: legal@shophub.com
                <br />
                Phone: +1 (555) 123-4567
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsConditions;
