import React, { useState, useEffect } from 'react';

const ImageSlider = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch slider images from API
    fetch('https://api.dharaniherbbals.com/api/sliders')
      .then(response => response.json())
      .then(data => {
        console.log('Slider data:', data);
        
        let slidesData = [];
        if (Array.isArray(data)) {
          slidesData = data;
        } else if (data && Array.isArray(data.data)) {
          slidesData = data.data.map(item => ({
            id: item.id,
            image: item.attributes?.image || item.image || item.attributes?.photo || item.photo,
            title: item.attributes?.title || item.title,
            description: item.attributes?.description || item.description
          }));
        }
        
        console.log('Processed slides:', slidesData);
        setSlides(slidesData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching sliders:', error);
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
    return <div className="h-[650px] md:h-[650px] sm:h-[450px] h-[300px] bg-gray-100 flex items-center justify-center">Loading slider...</div>;
  }

  if (slides.length === 0) {
    return <div className="h-[650px] md:h-[650px] sm:h-[450px] h-[300px] bg-gray-100 flex items-center justify-center">No slides available</div>;
  }

  return (
    <div className="relative w-full h-[300px] sm:h-[450px] md:h-[650px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id || index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {slide.image && (
            <img
              src={slide.image}
              alt={slide.title || `Slide ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error(`Error loading image for slide ${index}:`, slide.image);
                e.target.src = 'https://via.placeholder.com/1200x400?text=Image+Not+Available';
              }}
            />
          )}
          {(slide.title || slide.description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 sm:p-3 md:p-4">
              {slide.title && <h3 className="text-sm sm:text-lg md:text-xl font-bold">{slide.title}</h3>}
              {slide.description && <p className="text-xs sm:text-sm md:text-base hidden sm:block">{slide.description}</p>}
            </div>
          )}
        </div>
      ))}
      
      {/* Navigation dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1 sm:space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
              index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Previous/Next buttons */}
      <button
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-primary p-1 sm:p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        onClick={() => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)}
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 md:w-6 md:h-6">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-primary p-1 sm:p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 md:w-6 md:h-6">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
};

export default ImageSlider;