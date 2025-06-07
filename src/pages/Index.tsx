
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import TrendingProducts from '@/components/TrendingProducts';
import HotSellingProducts from '@/components/HotSellingProducts';
import Categories from '@/components/Categories';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="overflow-hidden">
        <Hero />
        <Categories />
        <FeaturedProducts />
        <TrendingProducts />
        <HotSellingProducts />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
