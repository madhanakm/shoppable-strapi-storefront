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
        <ErrorBoundary>
          <ProductBlocks />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};

export default Index;