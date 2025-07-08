import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import TranslatedText from '@/components/TranslatedText';

const Hero = () => {
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  
  return (
    <section className="relative bg-gradient-to-br from-green-50 via-white to-primary/10 py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  <TranslatedText textKey="hero.welcome" />
                </span>
                <span className={`bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent block mt-2 ${isTamil ? 'tamil-text' : ''}`}>
                  {translate('hero.companyName')}
                </span>
              </h1>
              <p className={`text-lg md:text-xl lg:text-2xl text-gray-600 max-w-lg leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
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

            <div className="grid grid-cols-3 gap-6 md:gap-8 pt-6 md:pt-8">
              <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">500+</div>
                <div className={`text-sm md:text-base text-gray-600 font-medium mt-1 ${isTamil ? 'tamil-text' : ''}`}>
                  {translate('hero.stats.products')}
                </div>
              </div>
              <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">50K+</div>
                <div className={`text-sm md:text-base text-gray-600 font-medium mt-1 ${isTamil ? 'tamil-text' : ''}`}>
                  {translate('hero.stats.customers')}
                </div>
              </div>
              <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">15+</div>
                <div className={`text-sm md:text-base text-gray-600 font-medium mt-1 ${isTamil ? 'tamil-text' : ''}`}>
                  {translate('hero.stats.experience')}
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-12 lg:mt-0 animate-fade-in-right">
            <div className="relative">
              {/* Floating background elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
              
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl md:rounded-[2rem] p-8 md:p-10 shadow-2xl border border-white/20 relative overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-green-100/30 rounded-3xl md:rounded-[2rem]"></div>
                
                <div className="grid grid-cols-2 gap-4 md:gap-6 relative z-10">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-7 shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary/10 group hover:-translate-y-2">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Leaf className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                    </div>
                    <h3 className={`font-bold text-base md:text-lg mb-2 md:mb-3 text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.ayurvedic.title')}
                    </h3>
                    <p className={`text-sm md:text-base text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.ayurvedic.description')}
                    </p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-7 shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary/10 group hover:-translate-y-2">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-200/50 to-green-100/30 rounded-2xl flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-300">
                      <div className="w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-primary to-green-600 rounded-full"></div>
                    </div>
                    <h3 className={`font-bold text-base md:text-lg mb-2 md:mb-3 text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.organic.title')}
                    </h3>
                    <p className={`text-sm md:text-base text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.organic.description')}
                    </p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-7 shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary/10 group hover:-translate-y-2">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-100/50 to-blue-50/30 rounded-2xl flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-300">
                      <div className="w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-primary to-blue-500 rounded-xl"></div>
                    </div>
                    <h3 className={`font-bold text-base md:text-lg mb-2 md:mb-3 text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.wellness.title')}
                    </h3>
                    <p className={`text-sm md:text-base text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.wellness.description')}
                    </p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-7 shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary/10 group hover:-translate-y-2">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-100/50 to-purple-50/30 rounded-2xl flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-300">
                      <div className="w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-primary to-purple-500 rounded-lg"></div>
                    </div>
                    <h3 className={`font-bold text-base md:text-lg mb-2 md:mb-3 text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('hero.categories.supplements.title')}
                    </h3>
                    <p className={`text-sm md:text-base text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
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