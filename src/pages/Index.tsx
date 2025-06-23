
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import TrendingProducts from '@/components/TrendingProducts';
import HotSellingProducts from '@/components/HotSellingProducts';
import Categories from '@/components/Categories';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import ImageSlider from '@/components/ImageSlider';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="overflow-hidden">
        <ErrorBoundary>
          <ImageSlider />
        </ErrorBoundary>
        <Hero />
        <ErrorBoundary>
          <Categories />
        </ErrorBoundary>
        <FeaturedProducts />
        <TrendingProducts />
        <HotSellingProducts />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
