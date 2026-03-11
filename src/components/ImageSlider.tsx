import React, { useState, useEffect } from 'react';

const ImageSlider = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.dharaniherbbals.com/api/sliders?filters[status][$eq]=true')
      .then(response => response.json())
      .then(data => {
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
        setSlides(slidesData);
        setLoading(false);
      })
      .catch(error => {
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
    return (
      <div className="relative h-[250px] sm:h-[400px] md:h-[800px] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8">
          <div className="space-y-3 md:space-y-4 max-w-2xl">
            <div className="h-6 sm:h-8 md:h-10 bg-gray-300/60 rounded-lg w-3/4 animate-pulse"></div>
            <div className="h-4 sm:h-5 md:h-6 bg-gray-300/60 rounded-lg w-1/2 animate-pulse" style={{ animationDelay: '200ms' }}></div>
          </div>
        </div>
        <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center space-x-2 sm:space-x-3">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white/50 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <style>{`
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  }

  if (slides.length === 0) {
    return <div className="h-[250px] sm:h-[400px] md:h-[800px] bg-gray-100 flex items-center justify-center">No slides available</div>;
  }

  return (
    <div className="relative w-full h-[250px] sm:h-[400px] md:h-[800px] overflow-hidden shadow-2xl isolate">
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
    </div>
  );
};

export default ImageSlider;
