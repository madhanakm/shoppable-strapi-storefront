import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
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
      
      if (currentScroll >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }, 3000);

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

  const getEmbedUrl = (instaLink: string) => {
    // Extract video ID from Instagram link
    let videoId = '';
    
    if (instaLink.includes('/reel/')) {
      videoId = instaLink.split('/reel/')[1]?.split('/')[0]?.split('?')[0];
    } else if (instaLink.includes('/p/')) {
      videoId = instaLink.split('/p/')[1]?.split('/')[0]?.split('?')[0];
    }
    
    if (videoId) {
      return `https://www.instagram.com/p/${videoId}/embed/captioned`;
    }
    
    return instaLink;
  };

  if (loading) {
    return (
      <section className="py-8 md:py-12 bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          </div>
        </div>
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
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4">
            <Instagram className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2 ${isTamil ? 'tamil-text' : ''}`}>
            {isTamil ? 'விளம்பர வீடியோக்கள்' : 'Featured Videos'}
          </h2>
          <p className={`text-gray-600 text-sm md:text-base ${isTamil ? 'tamil-text' : ''}`}>
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
                    className="flex-shrink-0 w-[240px] md:w-[280px] bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  >
                    {/* Video/Instagram */}
                    <div className="relative w-full h-[350px] md:h-[400px] bg-gray-900">
                      {post.attributes.videoFile?.data?.attributes?.url ? (
                        <video 
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        >
                          <source src={post.attributes.videoFile.data.attributes.url} type="video/mp4" />
                        </video>
                      ) : (
                        <a 
                          href={post.attributes.instaLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="relative z-10 text-center">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
                              <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                            <p className="text-white font-semibold text-sm">Watch on Instagram</p>
                          </div>
                          <img 
                            src={product.image || 'https://via.placeholder.com/400x450?text=Video'} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/400x450?text=Video';
                            }}
                          />
                        </a>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={product.image || 'https://via.placeholder.com/50x50?text=Product'} 
                          alt={product.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-pink-200"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/50x50?text=Product';
                          }}
                        />
                        <h3 className={`font-semibold text-base flex-1 line-clamp-2 uppercase ${isTamil ? 'tamil-text' : ''}`}>
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-2xl font-bold text-primary mb-3">
                        {isRange ? `${formatPrice(price.minPrice)} - ${formatPrice(price.maxPrice)}` : formatPrice(price)}
                      </p>
                      <Link to={`/product/${product.id}`}>
                        <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                          <ShoppingCart className="w-4 h-4 mr-2" />
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
    </section>
  );
};

export default InstagramReels;
