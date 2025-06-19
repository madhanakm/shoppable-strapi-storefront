
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Users, Target, Award, Heart } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">About Dharani Herbals</h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Your trusted partner in natural wellness, delivering authentic herbal products and traditional remedies since our inception.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Our Story</h2>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              Dharani Herbals was founded with a simple mission: to make authentic Ayurvedic and herbal products accessible to everyone, everywhere. 
              What started as a small venture has grown into a comprehensive herbal wellness platform serving thousands of satisfied customers.
            </p>
            <p className="text-muted-foreground text-sm md:text-base">
              We believe in the power of ancient wisdom combined with modern quality standards to provide natural healing solutions 
              that promote holistic health and well-being.
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-6 md:p-8">
            <div className="grid grid-cols-2 gap-4 md:gap-6 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary">50K+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Herbal Products</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary">99%</div>
                <div className="text-xs md:text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary">25+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Years Experience</div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Our Values</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-sm md:text-base">Customer First</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Every decision we make puts our customers at the center.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Target className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-sm md:text-base">Quality Focus</h3>
              <p className="text-xs md:text-sm text-muted-foreground">We carefully curate every product to ensure the highest standards.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Award className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-sm md:text-base">Excellence</h3>
              <p className="text-xs md:text-sm text-muted-foreground">We strive for excellence in everything we do.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Heart className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-sm md:text-base">Trust</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Building lasting relationships through transparency and reliability.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
