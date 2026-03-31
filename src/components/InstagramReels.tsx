import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getPriceByUserType, getVariablePriceRange } from '@/lib/pricing';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

interface InstaPost {
  id: number;
  attributes: {
    instaLink: string;
    product_id: string;
    status: boolean;
    videoFile?: any;
    thumbnailUrl?: string;
  };
}

interface Product {
  id: number;
  name: string;
  price: number;
  customerPrice?: number;
  dealerPrice?: number;
  distributorPrice?: number;
  image?: string;
  isVariable?: boolean;
  variations?: any[];
}

const InstagramReels = () => {
  const [posts, setPosts] = useState<InstaPost[]>([]);
  const [products, setProducts] = useState<{ [key: number]: Product }>({});
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { language, translate } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  useEffect(() => {
    fetchInstaPosts();
  }, []);

  // Auto scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || posts.length === 0 || loading) return;

    const scrollInterval = setInterval(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const currentScroll = container.scrollLeft;
      const cardWidth = window.innerWidth < 768 ? window.innerWidth * 0.3 + 8 : 300;
      if (currentScroll >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 1500);

    return () => clearInterval(scrollInterval);
  }, [posts, loading]);

  const fetchInstaPosts = async () => {
    try {
      const timestamp = new Date().getTime();
      
      // Fetch insta posts first
      const postsResponse = await fetch(`https://api.dharaniherbbals.com/api/insta-posts?filters[status][$eq]=true&pagination[pageSize]=100&timestamp=${timestamp}`);
      if (!postsResponse.ok) throw new Error(`Posts API error: ${postsResponse.status}`);
      
      const postsData = await postsResponse.json();
      if (!postsData.data || postsData.data.length === 0) {
        setLoading(false);
        return;
      }
      
      setPosts(postsData.data);
      
      // Get unique product IDs from posts
      const productIds = [...new Set(
        postsData.data
          .map((post: InstaPost) => parseInt(post.attributes.product_id))
          .filter((id: number) => !isNaN(id) && id > 0)
      )];
      
      if (productIds.length === 0) {
        setLoading(false);
        return;
      }
      
      // Fetch only required products by ID
      const productsMap: { [key: number]: Product } = {};
      
      await Promise.all(
        productIds.map(async (id) => {
          try {
            const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters/${id}?populate=variations&timestamp=${timestamp}`);
            if (response.ok) {
              const result = await response.json();
              if (result.data) {
                const attrs = result.data.attributes;
                
                // Parse variations if it's a string
                let variationsData = [];
                if (attrs.variations) {
                  if (typeof attrs.variations === 'string') {
                    try {
                      variationsData = JSON.parse(attrs.variations);
                    } catch (e) {
                      console.error('Failed to parse variations:', e);
                    }
                  } else if (Array.isArray(attrs.variations)) {
                    variationsData = attrs.variations;
                  } else if (attrs.variations.data) {
                    variationsData = attrs.variations.data;
                  }
                }
                
                const isVariable = variationsData.length > 0;
                
                productsMap[result.data.id] = {
                  id: result.data.id,
                  name: attrs.Name,
                  price: parseFloat(attrs.price || '0'),
                  customerPrice: parseFloat(attrs.customerprice || attrs.price || '0'),
                  dealerPrice: parseFloat(attrs.distributorprice || attrs.price || '0'),
                  distributorPrice: parseFloat(attrs.distributorprice || attrs.price || '0'),
                  image: attrs.photo,
                  isVariable: isVariable,
                  variations: variationsData
                };
              }
            } else {
              console.error(`Product ${id} fetch failed:`, response.status);
            }
          } catch (err) {
            console.error(`Failed to fetch product ${id}:`, err);
          }
        })
      );
      
      setProducts(productsMap);
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
    } finally {
      setLoading(false);
    }
  };


  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const getProductPrice = (product: Product) => {
    const userType = (user as any)?.userType?.toLowerCase() || 'customer';
    
    if (product.isVariable && product.variations && product.variations.length > 0) {
      const priceRange = getVariablePriceRange(product.variations, userType);
      if (priceRange && priceRange.minPrice > 0) {
        return priceRange;
      }
    }
    
    if (!user) return product.customerPrice || product.price;
    
    switch (userType) {
      case 'dealer':
        return product.dealerPrice || product.price;
      case 'distributor':
        return product.distributorPrice || product.price;
      default:
        return product.customerPrice || product.price;
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/,
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const openLightbox = (videoUrl: string) => {
    setCurrentVideo(videoUrl);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentVideo(null);
  };

  if (loading) {
    return (
      <section className="py-8 md:py-12 bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          {/* Loading Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4 animate-pulse">
              <Play className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-64 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-48 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Loading Slider Cards */}
        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex gap-4 md:gap-6 pb-4 px-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className="flex-shrink-0 w-[240px] md:w-[280px] bg-white shadow-lg rounded-lg overflow-hidden"
                >
                  {/* Video Skeleton with shimmer effect */}
                  <div className="relative w-full h-[350px] md:h-[400px] bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-gray-400/50 rounded-full flex items-center justify-center animate-pulse">
                        <Play className="w-8 h-8 text-gray-300" />
                      </div>
                    </div>
                  </div>
                  {/* Product Info Skeleton */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gray-300 animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                      </div>
                    </div>
                    <div className="h-8 bg-gray-300 rounded mb-3 w-1/2 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    <div className="h-10 bg-gradient-to-r from-red-300 to-red-400 rounded animate-pulse" style={{ animationDelay: '450ms' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4">
            <Play className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h2 className={`text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2 ${isTamil ? 'tamil-text' : ''}`}>
            {isTamil ? 'விளம்பர வீடியோக்கள்' : 'Featured Videos'}
          </h2>
          <p className={`text-gray-600 text-xs md:text-base ${isTamil ? 'tamil-text' : ''}`}>
            {isTamil ? 'எங்கள் சிறப்பு தயாரிப்புகளைப் பாருங்கள்' : 'Watch our featured products'}
          </p>
        </div>
      </div>

      {/* Scrollable Reels Container - Full Width */}
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>

        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 md:gap-6 pb-4 px-4">
          {posts.map((post) => {
            const productId = parseInt(post.attributes.product_id);
            const product = products[productId];
            if (!product) {
              return null;
            }

            const price = getProductPrice(product);
            const isRange = typeof price === 'object' && price.minPrice !== undefined;

            return (
                  <Card 
                    key={post.id} 
                    className="flex-shrink-0 w-[30vw] md:w-[280px] bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  >
                    {/* YouTube Shorts Thumbnail */}
                    <div className="relative w-full h-[42vw] md:h-[400px] bg-gray-900">
                      {(() => {
                        const videoId = getYouTubeVideoId(post.attributes.instaLink);
                        if (videoId) {
                          return (
                            <button
                              onClick={() => openLightbox(post.attributes.instaLink)}
                              className="absolute inset-0 flex items-center justify-center group cursor-pointer w-full h-full"
                            >
                              <img 
                                src={getYouTubeThumbnail(videoId)} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = product.image || 'https://via.placeholder.com/400x450?text=Video';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                                </div>
                              </div>
                            </button>
                          );
                        }
                        return (
                          <div className="w-full h-full flex items-center justify-center">
                            <img 
                              src={product.image || 'https://via.placeholder.com/400x450?text=Video'} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        );
                      })()}
                    </div>

                    {/* Product Info */}
                    <div className="p-2 md:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={product.image || 'https://via.placeholder.com/50x50?text=Product'} 
                          alt={product.name}
                          className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover border-2 border-pink-200"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/50x50?text=Product';
                          }}
                        />
                        <h3 className={`font-semibold text-xs md:text-base flex-1 line-clamp-2 uppercase ${isTamil ? 'tamil-text' : ''}`}>
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-sm md:text-2xl font-bold text-primary mb-2">
                        {isRange ? `${formatPrice(price.minPrice)} - ${formatPrice(price.maxPrice)}` : formatPrice(price)}
                      </p>
                      <Link to={`/product/${product.id}`}>
                        <Button className="w-full text-white text-xs md:text-sm py-1 md:py-2" style={{background: 'linear-gradient(to right, #009108, #55bf57)'}}>
                          <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          <span className={isTamil ? 'tamil-text' : ''}>
                            {isTamil ? 'இப்போது வாங்கவும்' : 'Buy Now'}
                          </span>
                        </Button>
                      </Link>
                    </div>
                </Card>
              );
          })}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && currentVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div 
            className="relative w-full max-w-[400px] aspect-[9/16] bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const videoId = getYouTubeVideoId(currentVideo);
              if (videoId) {
                return (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                );
              }
              return null;
            })()}
          </div>
        </div>
      )}
    </section>
  );
};

export default InstagramReels;
