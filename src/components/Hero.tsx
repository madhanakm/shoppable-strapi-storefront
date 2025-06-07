
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
                Discover Amazing
                <span className="text-primary block">Products</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-md">
                Shop from millions of products with fast delivery, secure payments, and unbeatable prices.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                View Categories
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10M+</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5M+</div>
                <div className="text-sm text-muted-foreground">Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-8 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-primary rounded-sm"></div>
                  </div>
                  <h3 className="font-semibold mb-2">Electronics</h3>
                  <p className="text-sm text-muted-foreground">Latest gadgets</p>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-secondary rounded-sm"></div>
                  </div>
                  <h3 className="font-semibold mb-2">Fashion</h3>
                  <p className="text-sm text-muted-foreground">Trendy styles</p>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-accent rounded-sm"></div>
                  </div>
                  <h3 className="font-semibold mb-2">Home</h3>
                  <p className="text-sm text-muted-foreground">Decor & more</p>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-muted/10 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-muted rounded-sm"></div>
                  </div>
                  <h3 className="font-semibold mb-2">Sports</h3>
                  <p className="text-sm text-muted-foreground">Gear & equipment</p>
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
