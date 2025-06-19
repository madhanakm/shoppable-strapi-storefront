
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 py-12 md:py-16 lg:py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center space-x-2 mb-3 md:mb-4">
                <Leaf className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                <span className="text-primary font-semibold text-sm md:text-base">100% Natural & Organic</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
                Natural Herbal
                <span className="text-primary block">Solutions</span>
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-md">
                Discover the power of nature with our premium herbal products. Trusted remedies for holistic wellness and natural healing.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button size="lg" className="group bg-primary hover:bg-primary/90 text-sm md:text-base">
                Shop Herbal Products
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-sm md:text-base">
                View Categories
              </Button>
            </div>

            <div className="flex items-center justify-between sm:justify-start sm:space-x-6 md:space-x-8 pt-4">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">500+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Herbal Products</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">50K+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">25+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Years Experience</div>
              </div>
            </div>
          </div>

          <div className="relative mt-8 lg:mt-0">
            <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl md:rounded-3xl p-6 md:p-8 backdrop-blur-sm border border-primary/20">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow border border-primary/10">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <Leaf className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Ayurvedic</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Traditional remedies</p>
                </div>
                <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow border border-primary/10">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-primary rounded-full"></div>
                  </div>
                  <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Organic</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Pure & natural</p>
                </div>
                <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow border border-primary/10">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-primary rounded-lg"></div>
                  </div>
                  <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Wellness</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Health & vitality</p>
                </div>
                <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow border border-primary/10">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-primary rounded-sm"></div>
                  </div>
                  <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Supplements</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Daily nutrition</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
