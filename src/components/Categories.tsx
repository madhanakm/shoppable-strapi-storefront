import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { getProductCategories } from '@/services/categories';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

const Categories = () => {
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Enhanced gradient colors with better visual appeal
  const bgColors = [
    'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600',
    'bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600',
    'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500',
    'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500',
    'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500',
    'bg-gradient-to-br from-green-400 via-emerald-500 to-cyan-500',
  ];

  useEffect(() => {
    // Fetch product categories with images
    getProductCategories()
      .then(categoryData => {
        // Process category data
        
        let formattedCategories = [];
        
        if (Array.isArray(categoryData)) {
          // Direct array format
          formattedCategories = categoryData.map((item, index) => ({
            id: index,
            name: item.Name,
            count: '0+ items',
            color: bgColors[index % bgColors.length],
            photo: item.photo
          }));
        } else if (categoryData && Array.isArray(categoryData.data)) {
          // Strapi format
          formattedCategories = categoryData.data.map((item, index) => ({
            id: item.id || index,
            name: item.Name || item.name || item.attributes?.Name || item.attributes?.name,
            count: '0+ items',
            color: bgColors[index % bgColors.length],
            photo: item.photo || item.attributes?.photo
          }));
        }
        
        // Show categories without counts for faster loading
        const categoriesWithGenericCounts = formattedCategories.map(category => ({
          ...category,
          count: translate('home.viewProducts')
        }));
        
        setCategories(categoriesWithGenericCounts);
        setLoading(false);
      })
      .catch(error => {
        // Handle category fetch error
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-8 bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/80 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-teal-400 rounded-full blur-2xl"></div>
      </div>
      
      <div className="w-full px-4 relative z-10">
        {/* Enhanced header section */}
        <div className="text-center mb-8">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent ${isTamil ? 'tamil-text' : ''}`}>
            {translate('home.shopByCategory')}
          </h2>
          <p className={`text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
            {translate('home.categoryDescription')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mt-6 rounded-full"></div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-4 h-4 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <p className={`mt-4 text-gray-600 ${isTamil ? 'tamil-text' : ''}`}>{translate('home.loadingCategories')}</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-1/2 -left-6 transform -translate-y-1/2 z-20">
              <button 
                onClick={() => {
                  const container = document.getElementById('categories-slider');
                  if (container) container.scrollBy({ left: -320, behavior: 'smooth' });
                }}
                className="group bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white border border-green-100 hover:border-green-200"
              >
                <svg className="w-5 h-5 text-green-600 group-hover:text-green-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            <div 
              id="categories-slider"
              className="flex overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory scroll-smooth w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-6 px-4 w-full">
                {categories.map((category, index) => (
                  <Link 
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    key={category.id}
                    className="snap-start flex-shrink-0 w-48 group"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <Card className="hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 shadow-lg hover:shadow-green-200/50 h-full bg-white/80 backdrop-blur-sm group-hover:bg-white overflow-hidden">
                      <CardContent className="p-6 text-center relative">
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Enhanced icon container */}
                        <div className={`relative w-20 h-20 ${category.color} rounded-2xl mx-auto mb-5 flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                          <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors duration-300"></div>
                          {category.photo ? (
                            <img 
                              src={category.photo}
                              alt={category.name}
                              className="w-full h-full object-cover relative z-10"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = `<span class="text-3xl text-white font-bold relative z-10">${category.name.charAt(0).toUpperCase()}</span>`;
                              }}
                            />
                          ) : (
                            <span className="text-3xl text-white font-bold relative z-10">
                              {category.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        {/* Enhanced text content */}
                        <h3 className={`font-bold text-base mb-2 text-gray-800 group-hover:text-green-700 transition-colors duration-300 relative z-10 ${isTamil ? 'tamil-text' : ''}`}>
                          {category.name}
                        </h3>
                        <p className={`text-sm text-gray-500 group-hover:text-green-600 transition-colors duration-300 relative z-10 ${isTamil ? 'tamil-text' : ''}`}>
                          {category.count}
                        </p>
                        
                        {/* Subtle arrow indicator */}
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 relative z-10">
                          <div className={`inline-flex items-center text-green-600 text-sm font-medium ${isTamil ? 'tamil-text' : ''}`}>
                            {translate('home.explore')}
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
              <button 
                onClick={() => {
                  const container = document.getElementById('categories-slider');
                  if (container) container.scrollBy({ left: 320, behavior: 'smooth' });
                }}
                className="group bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white border border-green-100 hover:border-green-200"
              >
                <svg className="w-5 h-5 text-green-600 group-hover:text-green-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Call to action */}
        <div className="text-center mt-12">
          <Link 
            to="/products" 
            className={`inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-full hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${isTamil ? 'tamil-text' : ''}`}
          >
            {translate('home.viewAllProducts')}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;