import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import TranslatedText from '@/components/TranslatedText';

const Hero = () => {
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 py-8 md:py-12 overflow-hidden">
      {/* Modern background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-400/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-emerald-400 rounded-full animate-ping delay-500"></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-green-300 rounded-full animate-ping delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <div className="space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-6 py-3">
              <Sparkles className="w-5 h-5 text-green-400" />
              <span className={`text-green-300 font-semibold text-sm ${isTamil ? 'tamil-text' : ''}`}>
                {translate('hero.organic')}
              </span>
            </div>
            
            {/* Main heading */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-none">
                <span className="bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent">
                  <TranslatedText textKey="hero.welcome" />
                </span>
                <br />
                <span className={`bg-gradient-to-r from-green-400 via-emerald-400 to-green-300 bg-clip-text text-transparent ${isTamil ? 'tamil-text' : ''}`}>
                  {translate('hero.companyName')}
                </span>
              </h1>
              <p className={`text-base md:text-lg text-gray-300 max-w-xl mx-auto ${isTamil ? 'tamil-text' : ''}`}>
                {translate('hero.description')}
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-bold rounded-full" asChild>
                <Link to="/products">
                  <Zap className="mr-2 h-5 w-5" />
                  <span className={isTamil ? 'tamil-text' : ''}>
                    {translate('hero.shopButton')}
                  </span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-green-400/50 text-green-300 hover:bg-green-500/20 hover:border-green-400 backdrop-blur-sm shadow-xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-bold rounded-full" asChild>
                <Link to="/about">
                  <span className={isTamil ? 'tamil-text' : ''}>
                    {translate('hero.knowMoreButton')}
                  </span>
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 pt-4 max-w-lg mx-auto">
              <div className="text-center group">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-3 hover:scale-105 transition-all duration-300">
                  <div className="text-xl md:text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">350+</div>
                  <div className={`text-xs text-green-300 font-medium ${isTamil ? 'tamil-text' : ''}`}>
                    Herbal Products
                  </div>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-3 hover:scale-105 transition-all duration-300">
                  <div className="text-xl md:text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">6L+</div>
                  <div className={`text-xs text-green-300 font-medium ${isTamil ? 'tamil-text' : ''}`}>
                    Happy Customers
                  </div>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-3 hover:scale-105 transition-all duration-300">
                  <div className="text-xl md:text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">15+</div>
                  <div className={`text-xs text-green-300 font-medium ${isTamil ? 'tamil-text' : ''}`}>
                    {translate('hero.stats.experience')}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-4 pt-4 opacity-70">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-green-300 font-medium">4.8/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">100% Natural</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span className="text-green-300 font-medium">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;