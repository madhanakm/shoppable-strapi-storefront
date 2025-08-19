import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf, Heart, Shield, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import TranslatedText from '@/components/TranslatedText';

const Hero = () => {
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  
  return (
    <section className="relative bg-gradient-to-br from-green-50 via-white to-primary/10 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-primary/3 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <div className="space-y-8 md:space-y-10 animate-fade-in-up">
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Leaf className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </div>
                <span className={`text-primary font-bold text-base md:text-lg tracking-wide ${isTamil ? 'tamil-text' : ''}`}>
                  {translate('hero.organic')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  <TranslatedText textKey="hero.welcome" />
                </span>
                <span className={`bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent block mt-1 sm:mt-2 ${isTamil ? 'tamil-text' : ''}`}>
                  {translate('hero.companyName')}
                </span>
              </h1>
              <p className={`text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-lg leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                {translate('hero.description')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
              <Button size="lg" className="group bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-500 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 px-8 py-4 text-base md:text-lg font-semibold" asChild>
                <Link to="/products">
                  <span className={isTamil ? 'tamil-text' : ''}>
                    {translate('hero.shopButton')}
                  </span>
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 px-8 py-4 text-base md:text-lg font-semibold" asChild>
                <Link to="/about">
                  <span className={isTamil ? 'tamil-text' : ''}>
                    {translate('hero.knowMoreButton')}
                  </span>
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 pt-4 sm:pt-6 md:pt-8">
              <div className="text-center p-2 sm:p-3 md:p-4 bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">350+</div>
                <div className={`text-xs sm:text-sm md:text-base text-gray-600 font-medium mt-1 leading-tight ${isTamil ? 'tamil-text' : ''}`}>
                  Herbal Products
                </div>
              </div>
              <div className="text-center p-2 sm:p-3 md:p-4 bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">6L+</div>
                <div className={`text-xs sm:text-sm md:text-base text-gray-600 font-medium mt-1 leading-tight ${isTamil ? 'tamil-text' : ''}`}>
                  Happy Customers
                </div>
              </div>
              <div className="text-center p-2 sm:p-3 md:p-4 bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">15+</div>
                <div className={`text-xs sm:text-sm md:text-base text-gray-600 font-medium mt-1 leading-tight ${isTamil ? 'tamil-text' : ''}`}>
                  {translate('hero.stats.experience')}
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-8 sm:mt-10 lg:mt-0 animate-fade-in-right">
            <div className="relative">
              {/* Floating background elements */}
              <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-16 sm:w-24 h-16 sm:h-24 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 w-20 sm:w-32 h-20 sm:h-32 bg-green-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
              
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl border border-white/20 relative overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-green-100/30 rounded-2xl sm:rounded-3xl md:rounded-[2rem]"></div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 relative z-10">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-7 shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary/10 group hover:-translate-y-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 lg:mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Leaf className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-primary" />
                    </div>
                    <h3 className={`font-bold text-xs sm:text-sm md:text-base lg:text-lg mb-1 sm:mb-2 md:mb-3 text-gray-800 leading-tight ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.ayurvedic.title')}
                    </h3>
                    <p className={`text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.ayurvedic.description')}
                    </p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-7 shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary/10 group hover:-translate-y-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-200/50 to-green-100/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 lg:mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-green-600" />
                    </div>
                    <h3 className={`font-bold text-xs sm:text-sm md:text-base lg:text-lg mb-1 sm:mb-2 md:mb-3 text-gray-800 leading-tight ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.organic.title')}
                    </h3>
                    <p className={`text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.organic.description')}
                    </p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-7 shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary/10 group hover:-translate-y-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-100/50 to-blue-50/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 lg:mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-blue-600" />
                    </div>
                    <h3 className={`font-bold text-xs sm:text-sm md:text-base lg:text-lg mb-1 sm:mb-2 md:mb-3 text-gray-800 leading-tight ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.wellness.title')}
                    </h3>
                    <p className={`text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.wellness.description')}
                    </p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-7 shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary/10 group hover:-translate-y-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-100/50 to-purple-50/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 lg:mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Pill className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-purple-600" />
                    </div>
                    <h3 className={`font-bold text-xs sm:text-sm md:text-base lg:text-lg mb-1 sm:mb-2 md:mb-3 text-gray-800 leading-tight ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.supplements.title')}
                    </h3>
                    <p className={`text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.supplements.description')}
                    </p>
                  </div>
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