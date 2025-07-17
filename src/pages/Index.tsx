import React from 'react';
import { Button } from '@/components/ui/button';
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

        {/* Promotional Banner */}
        <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-green-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white space-y-6">
                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
                  Limited Time Offer
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Get 30% Off
                  <span className="block text-2xl md:text-3xl lg:text-4xl font-normal opacity-90 mt-2">
                    On Your First Order
                  </span>
                </h2>
                <p className="text-xl opacity-90 leading-relaxed">
                  Start your wellness journey with our premium herbal products. Natural healing for modern life.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 shadow-xl">
                    Shop Now & Save
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
                      <div className="text-3xl font-bold">50K+</div>
                      <div className="text-sm opacity-90">Happy Customers</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
                      <div className="text-3xl font-bold">15+</div>
                      <div className="text-sm opacity-90">Years Experience</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
                      <div className="text-3xl font-bold">500+</div>
                      <div className="text-sm opacity-90">Products</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
                      <div className="text-3xl font-bold">24/7</div>
                      <div className="text-sm opacity-90">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Blocks */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Why Choose Our Products?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the power of nature with our carefully curated selection of herbal remedies and wellness products.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-green-100">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">🌱</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">100% Organic</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sourced directly from certified organic farms, ensuring the highest quality and purity in every product.
                </p>
              </div>
              <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-blue-100">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">🔬</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Lab Tested</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every batch is rigorously tested in certified laboratories to guarantee safety, potency, and effectiveness.
                </p>
              </div>
              <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-purple-100">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">💝</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Fast Delivery</h3>
                <p className="text-gray-600 leading-relaxed">
                  Quick and secure shipping with tracking, ensuring your wellness products reach you safely and on time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Banner */}
        <section className="py-20 bg-gradient-to-r from-gray-50 to-green-50 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                What Our Customers Say
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of satisfied customers who trust our products
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    R
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Rajesh Kumar</h4>
                    <div className="flex text-yellow-400">★★★★★</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  "Amazing products! I've been using their herbal supplements for 6 months and feel more energetic than ever."
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    P
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Priya Sharma</h4>
                    <div className="flex text-yellow-400">★★★★★</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  "The quality is exceptional and delivery is always on time. Highly recommend for natural wellness solutions."
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    A
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Amit Patel</h4>
                    <div className="flex text-yellow-400">★★★★★</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  "Best herbal products I've ever used. The customer service is outstanding and products are authentic."
                </p>
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