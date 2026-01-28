import React, { useState, useEffect } from 'react';

const ImageSlider = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch slider images from API with status filter
    fetch('https://api.dharaniherbbals.com/api/sliders?filters[status][$eq]=true')
      .then(response => response.json())
      .then(data => {
        // Process slider data
        
        let slidesData = [];
        if (Array.isArray(data)) {
          slidesData = data.filter(item => item.status === true);
        } else if (data && Array.isArray(data.data)) {
          slidesData = data.data
            .filter(item => {
              const attrs = item.attributes || item;
              return attrs.status === true;
            })
            .map(item => ({
              id: item.id,
              image: item.attributes?.image || item.image || item.attributes?.photo || item.photo,
              title: item.attributes?.title || item.title,
              description: item.attributes?.description || item.description
            }));
        }
        
        // Set slides data
        setSlides(slidesData);
        setLoading(false);
      })
      .catch(error => {
        // Handle slider fetch error
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return <div className="h-[250px] sm:h-[400px] md:h-[800px] bg-gray-100 flex items-center justify-center">Loading slider...</div>;
  }

  if (slides.length === 0) {
    return <div className="h-[250px] sm:h-[400px] md:h-[800px] bg-gray-100 flex items-center justify-center">No slides available</div>;
  }

  return (
    <div className="relative w-full h-[250px] sm:h-[400px] md:h-[800px] overflow-hidden shadow-2xl isolate">
      {/* Background overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10"></div>
      
      {slides.map((slide, index) => (
        <div
          key={slide.id || index}
          className={`absolute top-0 left-0 w-full h-full transition-all duration-1000 ease-in-out ${
            index === currentSlide 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-105'
          }`}
        >
          {slide.image && (
            <img
              src={slide.image}
              alt={slide.title || `Slide ${index + 1}`}
              className="w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-105"
              onError={(e) => {
                // Handle image loading error
                e.target.src = 'https://via.placeholder.com/1200x400?text=Image+Not+Available';
              }}
            />
          )}
          {(slide.title || slide.description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white p-4 sm:p-6 md:p-8 z-20">
              {slide.title && (
                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mb-2 md:mb-3 animate-fade-in-up">
                  {slide.title}
                </h3>
              )}
              {slide.description && (
                <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl leading-relaxed animate-fade-in-up">
                  {slide.description}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
      
      {/* Navigation dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center space-x-2 sm:space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full border-2 ${
              index === currentSlide 
                ? 'w-3 h-3 sm:w-4 sm:h-4 bg-white border-white shadow-lg scale-110' 
                : 'w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white/50 border-white/70 hover:bg-white/70 hover:scale-105'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Previous/Next buttons */}
      <button
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-primary p-1.5 sm:p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border border-white/20 z-20 group"
        onClick={() => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)}
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-primary p-1.5 sm:p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border border-white/20 z-20 group"
        onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
};

export default ImageSlider;