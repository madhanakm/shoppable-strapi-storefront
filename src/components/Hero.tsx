import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

const slides = [
  {
    id: 1,
    image: 'https://api.dharaniherbbals.com/uploads/about_54cd77d099.jpg',
    badge: 'Botanically Pure',
    title: 'Welcome to',
    highlight: 'Dharani Herbbals',
    description: 'Authentic herbal products rooted in Siddha & Ayurveda traditions for natural healing.',
    cta: { label: 'Shop Now', link: '/products' },
    accent: 'from-green-400 to-emerald-400',
  },
  {
    id: 2,
    image: 'https://api.dharaniherbbals.com/uploads/about_54cd77d099.jpg',
    badge: 'Traditionally Rooted',
    title: '15+ Years of',
    highlight: 'Trusted Healing',
    description: 'Over 6 lakh customers served with 350+ chemical-free herbal products.',
    cta: { label: 'Explore Products', link: '/products' },
    accent: 'from-emerald-400 to-teal-400',
  },
  {
    id: 3,
    image: 'https://api.dharaniherbbals.com/uploads/about_54cd77d099.jpg',
    badge: '100% Chemical-Free',
    title: "Nature's Best",
    highlight: 'For Your Wellness',
    description: 'Handcrafted with pure ingredients. No chemicals, no compromises.',
    cta: { label: 'Know More', link: '/about' },
    accent: 'from-teal-400 to-green-400',
  },
];

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  const goTo = useCallback((index: number) => {
    if (animating || index === current) return;
    setAnimating(true);
    setPrev(current);
    setCurrent(index);
    setTimeout(() => {
      setPrev(null);
      setAnimating(false);
    }, 700);
  }, [animating, current]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prevSlide = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ height: 'clamp(420px, 60vh, 620px)' }}>

      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0"
          style={{
            opacity: i === current ? 1 : i === prev ? 0 : 0,
            transition: 'opacity 700ms ease-in-out',
            zIndex: i === current ? 2 : i === prev ? 1 : 0,
          }}
        >
          <img src={s.image} alt={s.highlight} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="w-full px-6 md:px-16 lg:px-24">
          <div
            key={current}
            className="max-w-xl space-y-4"
            style={{ animation: 'slideUp 0.6s ease forwards' }}
          >
            <span className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 text-green-300 text-xs font-semibold px-4 py-1.5 rounded-full">
              ✦ {slides[current].badge}
            </span>
            <div>
              <p className="text-white/80 text-lg md:text-xl font-medium">{slides[current].title}</p>
              <h1 className={`text-3xl md:text-5xl lg:text-6xl font-black leading-tight bg-gradient-to-r ${slides[current].accent} bg-clip-text text-transparent ${isTamil ? 'tamil-text' : ''}`}>
                {slides[current].highlight}
              </h1>
            </div>
            <p className="text-gray-300 text-sm md:text-base max-w-md leading-relaxed">
              {slides[current].description}
            </p>
            <div className="flex gap-3 pt-2">
              <Button size="lg" className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-xl rounded-full px-6 font-bold" asChild>
                <Link to={slides[current].cta.link}>
                  <Zap className="mr-2 h-4 w-4" />
                  {slides[current].cta.label}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <a
                href="https://play.google.com/store/apps/details?id=com.dharaniherbbals.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full transition-all text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                Google Play
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next */}
      <button onClick={prevSlide} className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-black/60 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-black/60 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Rectangle bar indicators */}
      <div className="absolute bottom-16 md:bottom-14 left-6 md:left-16 z-20 flex gap-2 items-center">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="relative overflow-hidden rounded-sm transition-all duration-500"
            style={{ width: i === current ? 40 : 20, height: 3, background: 'rgba(255,255,255,0.3)' }}
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

      {/* Stats bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-sm border-t border-white/10 hidden md:flex">
        {[
          { value: '15+', label: 'Years of Trust' },
          { value: '6L+', label: 'Customers Served' },
          { value: '350+', label: 'Products Crafted' },
          { value: '100%', label: 'Chemical-Free' },
        ].map((stat, i) => (
          <div key={i} className="flex-1 text-center py-3 border-r border-white/10 last:border-0">
            <div className="text-green-400 font-black text-lg">{stat.value}</div>
            <div className="text-white/60 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

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
    </section>
  );
};

export default Hero;
