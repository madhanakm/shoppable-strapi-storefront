import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import { useNewLaunchProducts } from '@/hooks/useProductQueries';
import { useUserType } from '@/hooks/useUserTypeQuery';

const NewLaunchProducts = () => {
  const { data: userType = 'customer' } = useUserType();
  const { data: { products = [] } = {}, isLoading: loading } = useNewLaunchProducts(userType, 5);
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 animate-pulse" style={{background: 'linear-gradient(to right, #8ac440, #4ab748)'}}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-48 mx-auto mb-2 animate-pulse"></div>
          </div>
          <div className="flex justify-center gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-32 sm:w-40 animate-pulse">
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="p-3 sm:p-4">
                    <div className="aspect-square bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="text-center pb-3 sm:pb-4 px-2">
                    <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Enhanced Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full filter blur-2xl opacity-30 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{backgroundColor: '#8ac440'}}></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full filter blur-2xl opacity-30 translate-x-1/2 translate-y-1/2 animate-pulse" style={{backgroundColor: '#4ab748', animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full filter blur-xl opacity-20 animate-pulse" style={{backgroundColor: '#0a7f06', animationDelay: '2s'}}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-4 shadow-xl animate-bounce" style={{background: 'linear-gradient(to right, #8ac440, #4ab748)'}}>
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 ${isTamil ? 'tamil-text' : ''}`}>
            <span className="bg-clip-text text-transparent" style={{backgroundImage: 'linear-gradient(to right, #0a7f06, #4ab748, #8ac440)'}}>
              {isTamil ? 'புதிய வெளியீடுகள்' : 'New Launches'}
            </span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-8 h-1 rounded-full" style={{background: 'linear-gradient(to right, #8ac440, #4ab748)'}}></div>
            <div className="w-12 h-2 rounded-full" style={{background: 'linear-gradient(to right, #0a7f06, #4ab748)'}}></div>
            <div className="w-8 h-1 rounded-full" style={{background: 'linear-gradient(to right, #4ab748, #8ac440)'}}></div>
          </div>
        </div>

        {/* Mobile-Optimized Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-8">
          {products.map((product, index) => (
            <Link 
              key={product.id}
              to={`/products?newLaunch=true&category=${encodeURIComponent(product.category || '')}`}
              className="group transform transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-green-100 hover:border-green-200">
                {/* Product Image with Enhanced Mobile Design */}
                <div className="relative p-3 sm:p-4">
                  {/* New Launch Badge */}
                  <div className="absolute top-1 right-1 z-10 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1" style={{background: 'linear-gradient(to right, #8ac440, #4ab748)'}}>
                    <Sparkles className="w-2 h-2 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">{isTamil ? 'புதிய' : 'New'}</span>
                  </div>
                  
                  {/* Circular Product Image */}
                  <div className="aspect-square rounded-full overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg group-hover:shadow-xl transition-all duration-300 border-2 border-white">
                    <img
                      src={product.image || 'https://via.placeholder.com/300x300?text=Product'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Product';
                      }}
                    />
                  </div>
                  
                  {/* Sparkle Animation Effects */}
                  <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{animationDelay: '0s'}}></div>
                  <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{animationDelay: '0.5s'}}></div>
                </div>

                {/* Enhanced Product Info */}
                <div className="text-center pb-3 sm:pb-4 px-2">
                  <h3 className={`font-semibold text-gray-800 text-xs sm:text-sm group-hover:text-green-600 transition-colors duration-300 line-clamp-1 ${isTamil ? 'tamil-text' : ''}`}>
                    {product.category || 'General'}
                  </h3>
                  
                  {/* Mobile-friendly hover indicator */}
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                      <span>{isTamil ? 'பார்க்க' : 'View'}</span>
                      <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Enhanced View All Button */}
        <div className="text-center">
          <Link to="/products?newLaunch=true">
            <button className="group relative text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm sm:text-base transform hover:scale-105 overflow-hidden" style={{background: 'linear-gradient(to right, #0a7f06, #4ab748)'}}>
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <span className={`relative z-10 flex items-center gap-2 ${isTamil ? 'tamil-text' : ''}`}>
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                {isTamil ? 'அனைத்தையும் பார்க்க' : 'View All New Launches'}
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewLaunchProducts;