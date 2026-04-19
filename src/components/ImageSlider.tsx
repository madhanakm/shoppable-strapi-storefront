import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageSlider = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetch('https://api.dharaniherbbals.com/api/sliders?filters[status][$eq]=true')
      .then(r => r.json())
      .then(data => {
        let slidesData = [];
        if (data && Array.isArray(data.data)) {
          slidesData = data.data
            .filter(item => (item.attributes || item).status === true)
            .map(item => ({
              id: item.id,
              image: item.attributes?.photo || item.attributes?.image || item.photo || item.image,
              title: item.attributes?.title || item.title,
              description: item.attributes?.description || item.description,
            }));
        }
        setSlides(slidesData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const goTo = useCallback((index: number) => {
    if (animating || index === current || slides.length === 0) return;
    setAnimating(true);
    setPrev(current);
    setCurrent(index);
    setTimeout(() => {
      setPrev(null);
      setAnimating(false);
    }, 700);
  }, [animating, current, slides.length]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo, slides.length]);
  const prevSlide = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo, slides.length]);

  useEffect(() => {
    if (slides.length > 1) {
      timerRef.current = setInterval(next, 5000);
      return () => clearInterval(timerRef.current);
    }
  }, [next, slides.length]);

  if (loading) {
    return (
      <div className="relative w-full bg-gray-200 animate-pulse" style={{ height: 'clamp(250px, 55vh, 600px)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden bg-black shadow-2xl" style={{ height: 'clamp(350px, 70vh, 800px)' }}>

      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.id || i}
          className="absolute inset-0"
          style={{
            opacity: i === current ? 1 : i === prev ? 0 : 0,
            transition: 'opacity 700ms ease-in-out',
            zIndex: i === current ? 2 : i === prev ? 1 : 0,
          }}
        >
          <img
            src={slide.image}
            alt={slide.title || `Slide ${i + 1}`}
            className="w-full h-full object-cover object-center"
            onError={(e: any) => { e.target.src = 'https://via.placeholder.com/1200x600?text=Dharani+Herbbals'; }}
          />
          {/* Overlay only if title/description exists */}
          {(slide.title || slide.description) && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
          )}
        </div>
      ))}

      {/* Content */}
      {(slides[current]?.title || slides[current]?.description) && (
        <div className="absolute inset-0 z-10 flex items-center px-6 md:px-16">
          <div key={current} className="max-w-xl space-y-3" style={{ animation: 'slideUp 0.6s ease forwards' }}>
            {slides[current]?.title && (
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
                {slides[current].title}
              </h2>
            )}
            {slides[current]?.description && (
              <p className="text-gray-200 text-sm md:text-base max-w-md leading-relaxed">
                {slides[current].description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Prev / Next */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/30 hover:bg-black/60 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/30 hover:bg-black/60 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Rectangle bar indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative overflow-hidden rounded-sm transition-all duration-500"
              style={{ width: i === current ? 40 : 20, height: 3, background: 'rgba(255,255,255,0.35)' }}
            >
              {i === current && (
                <span
                  className="absolute inset-0 bg-green-400 rounded-sm"
                  style={{ animation: 'progress 5s linear forwards' }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ImageSlider;
