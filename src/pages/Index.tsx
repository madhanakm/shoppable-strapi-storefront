import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import ImageSlider from '@/components/ImageSlider';
import ProductBlocks from '@/components/ProductBlocks';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30">
      <Header />
      <main className="overflow-hidden">
        {/* Hero Image Slider */}
        <ErrorBoundary>
          <div className="relative">
            <ImageSlider />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20 pointer-events-none" />
          </div>
        </ErrorBoundary>
        
        {/* Hero Section */}
        <ErrorBoundary>
          <div className="relative -mt-20 z-10">
            <Hero />
          </div>
        </ErrorBoundary>
        
        {/* Categories Section */}
        <ErrorBoundary>
          <div className="py-16 bg-gradient-to-r from-green-50 to-emerald-50">
            <Categories />
          </div>
        </ErrorBoundary>
        
        {/* Product Blocks Section */}
        <ErrorBoundary>
          <div className="py-16 bg-white relative">
            <div className="absolute inset-0 bg-gradient-to-b from-green-50/20 to-transparent" />
            <div className="relative z-10">
              <ProductBlocks />
            </div>
          </div>
        </ErrorBoundary>
        
        {/* Trust Indicators */}
        <section className="py-16 bg-gradient-to-r from-emerald-100 to-green-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-2xl">🌿</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">100% Natural</h3>
                <p className="text-sm text-gray-600">Pure herbal products</p>
              </div>
              <div className="group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Free Delivery</h3>
                <p className="text-sm text-gray-600">On orders above ₹500</p>
              </div>
              <div className="group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Secure Payment</h3>
                <p className="text-sm text-gray-600">Safe & encrypted</p>
              </div>
              <div className="group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Quality Assured</h3>
                <p className="text-sm text-gray-600">Lab tested products</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;