import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import ImageSlider from '@/components/ImageSlider';
import ProductBlocks from '@/components/ProductBlocks';
import SimpleGoogleReviews from '@/components/SimpleGoogleReviews';

const Index = () => {
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30">
      <Helmet>
        {/* Basic Meta Tags */}
        <title>Dharani Herbbals - Premium Natural & Herbal Products | Ayurvedic Wellness</title>
        <meta name="description" content="Discover premium natural and herbal products at Dharani Herbbals. Traditional Ayurvedic remedies, organic wellness solutions, and quality-assured herbal medicines for your health journey." />
        <meta name="keywords" content="herbal products, ayurveda, natural remedies, organic wellness, traditional medicine, herbal supplements, ayurvedic products, natural health, wellness products, herbal medicine" />
        <link rel="canonical" href="https://dharaniherbbals.com/" />
        
        {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Dharani Herbbals - Premium Natural & Herbal Products" />
        <meta property="og:description" content="Discover premium natural and herbal products. Traditional Ayurvedic remedies, organic wellness solutions for your health journey. ✅ 100% Natural ✅ Lab Tested ✅ Free Delivery" />
        <meta property="og:image" content="https://api.dharaniherbbals.com/uploads/favicon_b04c8c6af4.png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:url" content="https://dharaniherbbals.com/" />
        <meta property="og:site_name" content="Dharani Herbbals" />
        <meta property="og:locale" content="en_IN" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dharani Herbbals - Premium Natural & Herbal Products" />
        <meta name="twitter:description" content="Discover premium natural and herbal products. Traditional Ayurvedic remedies, organic wellness solutions. 100% Natural • Lab Tested • Free Delivery" />
        <meta name="twitter:image" content="https://api.dharaniherbbals.com/uploads/favicon_b04c8c6af4.png" />
        <meta name="twitter:site" content="@dharaniherbbals" />
        
        {/* WhatsApp Specific */}
        <meta property="og:image:alt" content="Dharani Herbbals - Premium Natural & Herbal Products for Wellness" />
        
        {/* Structured Data for Google */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Dharani Herbbals",
            "description": "Premium natural and herbal products for wellness. Traditional Ayurvedic remedies and organic health solutions.",
            "url": "https://dharaniherbbals.com",
            "logo": "https://api.dharaniherbbals.com/uploads/favicon_b04c8c6af4.png",
            "image": "https://api.dharaniherbbals.com/uploads/favicon_b04c8c6af4.png",
            "sameAs": [
              "https://facebook.com/dharaniherbbals",
              "https://instagram.com/dharaniherbbals",
              "https://twitter.com/dharaniherbbals"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-9876543210",
              "contactType": "customer service",
              "availableLanguage": ["English", "Tamil"]
            },
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "IN",
              "addressRegion": "Tamil Nadu"
            }
          })}
        </script>
        
        {/* Mobile & Theme */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Helmet>
      <Header />
      <main className="overflow-hidden">
        {/* Hero Image Slider */}
        <ErrorBoundary>
          <div className="relative mb-4">
            <ImageSlider />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20 pointer-events-none" />
          </div>
        </ErrorBoundary>
        
        {/* Hero Section */}
        <ErrorBoundary>
          <div className="relative -mt-16 z-10">
            <Hero />
          </div>
        </ErrorBoundary>
        
        {/* Categories Section */}
        <ErrorBoundary>
          <div className="py-16 bg-gradient-to-r from-green-50 to-emerald-50">
            <Categories />
          </div>
        </ErrorBoundary>
        
        {/* Google Reviews Section - Full Screen */}
        <ErrorBoundary>
          <section className="py-16 bg-gray-50 w-full">
            <SimpleGoogleReviews 
              businessName="Dharani Herbbals"
              googleMapsUrl="https://www.google.com/maps/place/Dharani+Herbbals/@11.3580339,77.1641668,17.06z/data=!4m8!3m7!1s0x3ba8e1bdd6179ddb:0x82f81936cbaf1a2!8m2!3d11.3580361!4d77.166633!9m1!1b1!16s%2Fg%2F11c6f588fq!5m1!1e1?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D"
              rating={4.8}
              reviewCount={150}
            />
          </section>
        </ErrorBoundary>
        
        {/* Product Blocks Section */}
        <ErrorBoundary>
          <div className="py-16 bg-white relative">
            <div className="absolute inset-0 bg-gradient-to-b from-green-50/20 to-transparent" />
            <div className="relative z-10">
              <ProductBlocks />
            </div>
          </div>
        </ErrorBoundary>
        
        {/* Trust Indicators */}
        <section className="py-16 bg-gradient-to-r from-emerald-100 to-green-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-2xl">🌿</span>
                </div>
                <h3 className={`font-semibold text-gray-800 mb-2 ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ? '100% இயற்கை' : '100% Natural'}
                </h3>
                <p className={`text-sm text-gray-600 ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ? 'தூய மூலிகை தயாரிப்புகள்' : 'Pure herbal products'}
                </p>
              </div>
              <div className="group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className={`font-semibold text-gray-800 mb-2 ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ? 'இலவச டெலிவரி' : 'Free Delivery'}
                </h3>
                <p className={`text-sm text-gray-600 ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ? '₹750 (TN) / ₹1000 (மற்ற மாநிலங்கள்) க்கு மேல் ஆர்டர்களில்' : 'On orders above ₹750 (Tamil Nadu) / ₹1000 (Other States)'}
                </p>
              </div>
              <div className="group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className={`font-semibold text-gray-800 mb-2 ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ? 'பாதுகாப்பான பணம் செலுத்தல்' : 'Secure Payment'}
                </h3>
                <p className={`text-sm text-gray-600 ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ? 'பாதுகாப்பான & மறையாக்கப்பட்ட' : 'Safe & encrypted'}
                </p>
              </div>
              <div className="group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className={`font-semibold text-gray-800 mb-2 ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ? 'தரம் உறுதி செய்யப்பட்டது' : 'Quality Assured'}
                </h3>
                <p className={`text-sm text-gray-600 ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ? 'ஆய்வகத்தில் சோதிக்கப்பட்ட தயாரிப்புகள்' : 'Lab tested products'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;