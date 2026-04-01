import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import './ProductDetail.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Star, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlistContext } from '@/contexts/WishlistContext';
import { useQuickCheckout } from '@/hooks/useQuickCheckout';
import { useBuyNow } from '@/hooks/useBuyNow';
import { formatPrice } from '@/lib/utils';
import { getPriceByUserType } from '@/lib/pricing';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import ReviewForm from '@/components/ReviewForm';
import ProductReviews from '@/components/ProductReviews';
import StarRating from '@/components/StarRating';
import { getProductReviewStats } from '@/services/reviews';
import { ProductDetailSkeleton } from '@/components/ProductSkeleton';
import { useProduct, useRelatedProducts, useProductReviewStats } from '@/hooks/useProductQueries';
import { useUserType } from '@/hooks/useUserTypeQuery';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const { buyNow } = useBuyNow();
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  
  // ===== USE REACT QUERY HOOKS FOR PARALLEL DATA FETCHING =====
  const { data: userType = 'customer', isLoading: userTypeLoading } = useUserType();
  const { data: product, isLoading: productLoading, isError: productError } = useProduct(id, userType);
  const { data: relatedProducts = [], isLoading: relatedLoading } = useRelatedProducts(
    product?.category,
    product?.brand,
    parseInt(id!),
    userType
  );
  const { data: reviewStats = { average: 0, count: 0 }, isLoading: reviewsLoading } = useProductReviewStats(
    parseInt(id!),
    product?.skuid || product?.SKUID
  );
  // ===== END REACT QUERY HOOKS =====

  // Local state for UI interactions only
  const [quantity, setQuantity] = useState(1);
  const [zoomActive, setZoomActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [variations, setVariations] = useState([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  
  // Derived loading state
  const loading = productLoading || userTypeLoading;
  
  // Refs for image zoom
  const imageContainerRef = useRef(null);
  const zoomedImageRef = useRef(null);

  // Fetch all categories and brands for sidebar
  useEffect(() => {
    const token = import.meta.env.VITE_STRAPI_API_TOKEN;
    Promise.all([
      fetch('https://api.dharaniherbbals.com/api/product-categories?fields[0]=Name&pagination[pageSize]=100', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('https://api.dharaniherbbals.com/api/brands?fields[0]=Name&fields[1]=name&pagination[pageSize]=100', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ]).then(([catData, brandData]) => {
      setAllCategories((catData.data || []).map((c: any) => (c.attributes?.Name || c.attributes?.name || '').trim().toUpperCase()).filter(Boolean));
      setAllBrands((brandData.data || []).map((b: any) => (b.attributes?.Name || b.attributes?.name || '').trim().toUpperCase()).filter(Boolean));
    }).catch(() => {});
  }, []);

  // Update gallery images when product changes
  useEffect(() => {
    if (product) {
      setGalleryImages([]);
      setSelectedImage(null);
      setReviewsRefreshKey(prev => prev + 1);
      window.scrollTo(0, 0);
      
      // Set gallery images if available
      if (product.gallery && Array.isArray(product.gallery)) {
        setGalleryImages(product.gallery);
      } else if (product.gallery && typeof product.gallery === 'string') {
        try {
          const parsedGallery = JSON.parse(product.gallery);
          if (Array.isArray(parsedGallery)) {
            setGalleryImages(parsedGallery);
          }
        } catch {}
      }

      // Handle variations if variable product
      if (product.isVariableProduct && product.variations) {
        try {
          const variationsData = typeof product.variations === 'string'
            ? JSON.parse(product.variations)
            : product.variations;
          setVariations(variationsData || []);
        } catch {}
      }
    }
  }, [product]);

  // Set default image when product loads
  useEffect(() => {
    if (product && product.photo && !selectedImage) {
      setSelectedImage(product.photo);
    }
  }, [product, selectedImage]);

  // Track ViewContent event after product and userType are loaded
  useEffect(() => {
    if (product && userType !== null && typeof window !== 'undefined') {
      const productPrice = product?.displayPrice || 0;
      
      if (window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_name: product.Name || product.name,
          content_ids: [product.id.toString()],
          content_type: 'product',
          value: productPrice,
          currency: 'INR'
        });
      }
      
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'view_item',
          ecommerce: {
            items: [{
              item_id: product.id.toString(),
              item_name: product.Name || product.name,
              price: productPrice
            }]
          }
        });
      }
    }
  }, [product, userType]);
  
  
  const handleVariationChange = (variation) => {
    setSelectedVariation(variation);
    
    // Update selected image if variation has an image
    if (variation.image) {
      setSelectedImage(variation.image);
    }
  };

  // Helper function to get current display price
  const getCurrentPrice = () => {
    if (selectedVariation) {
      return getPriceByUserType(selectedVariation, userType || 'customer');
    }
    return product?.displayPrice || 0;
  };

  // Handle mouse move for zoom effect
  const handleMouseMove = (e) => {
    if (!imageContainerRef.current || !zoomedImageRef.current) return;
    
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    zoomedImageRef.current.style.transformOrigin = `${x * 100}% ${y * 100}%`;
  };

  const handleAddToCart = () => {
    if (product) {
      let productId, skuid;
      
      if (product.isVariableProduct && selectedVariation && selectedVariation.skuid) {
        skuid = selectedVariation.skuid.toString();
        productId = product.id.toString();
      } else {
        productId = product.id.toString();
        skuid = product.skuid || product.SKUID || productId;
      }
      
      const productName = product.Name || product.name || product.title;
      addToCart(skuid, productId, quantity, productName, getCurrentPrice());
    }
  };
  
  const handleBuyNow = () => {
    if (product) {
      let skuid, productId;
      
      if (product.isVariableProduct && selectedVariation) {
        skuid = selectedVariation.skuid || `${product.id}-${selectedVariation.value || selectedVariation.attributeValue}`;
        productId = product.id.toString();
      } else {
        skuid = product.skuid || product.SKUID || product.id.toString();
        productId = product.id.toString();
      }
      
      const checkoutItem = {
        id: productId,
        skuid: skuid,
        name: product.Name || product.name || product.title,
        tamil: product.tamil || null,
        price: getCurrentPrice(),
        image: selectedImage || product.photo || product.image,
        category: product.category,
        quantity: quantity
      };
      
      if (product.isVariableProduct && selectedVariation) {
        const variationName = selectedVariation.value || selectedVariation.attributeValue || Object.values(selectedVariation)[0];
        checkoutItem.variation = variationName;
        checkoutItem.name = `${checkoutItem.name} - ${variationName}`;
      }
      
      buyNow(checkoutItem);
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    const productId = product.id.toString();

    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Skeleton */}
            <div className="lg:w-80 flex-shrink-0 order-last lg:order-first">
              <div className="sticky top-24 space-y-4">
                {/* Categories Card Skeleton */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-16 bg-gradient-to-r from-gray-300 to-gray-400"></div>
                  <div className="p-4 space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                        <div className="h-4 bg-gray-300 rounded flex-1"></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Brands Card Skeleton */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-16 bg-gradient-to-r from-blue-300 to-purple-400"></div>
                  <div className="p-4 space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                        <div className="h-4 bg-gray-300 rounded flex-1"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Image Skeleton */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="relative bg-gradient-to-br from-gray-50 to-white p-8">
                  <div className="w-full h-[500px] bg-gray-200 rounded-2xl"></div>
                </div>
                
                {/* Gallery Skeleton */}
                <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
                  <div className="flex gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>
                
                {/* Description Skeleton */}
                <div className="p-6 border-t border-gray-100">
                  <div className="h-6 bg-gray-300 rounded w-32 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Info Skeleton */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10 animate-pulse">
                {/* Title and Rating Skeleton */}
                <div className="mb-6">
                  <div className="h-8 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-5 w-5 bg-gray-200 rounded-full"></div>
                    ))}
                    <div className="h-4 bg-gray-200 rounded w-16 ml-2"></div>
                  </div>
                </div>
                
                {/* Price Skeleton */}
                <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-green-50 rounded-2xl">
                  <div className="h-12 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                
                {/* Quantity Skeleton */}
                <div className="mb-8">
                  <div className="h-4 bg-gray-300 rounded w-16 mb-3"></div>
                  <div className="h-12 bg-gray-200 rounded-2xl w-32"></div>
                </div>
                
                {/* Buttons Skeleton */}
                <div className="mb-8">
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1 h-12 bg-gray-300 rounded-xl"></div>
                    <div className="flex-1 h-12 bg-gray-300 rounded-xl"></div>
                  </div>
                  <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
                </div>
                
                {/* Product Details Skeleton */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                  <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-3 bg-white rounded-xl">
                        <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Loading Status */}
          <div className="text-center py-12">
            <div className="relative inline-block mb-4">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-green-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">Loading Product Details...</p>
            <p className="text-sm text-gray-500">Please wait while we fetch the product information</p>
            <div className="flex justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Render meta tags immediately, even before product loads
  const renderMetaTags = () => {
    const productName = product?.Name || product?.name || 'Premium Herbal Product';
    const productDesc = product?.description || product?.desc || 'Premium natural herbal product from Dharani Herbbals';
    const productImage = selectedImage || product?.photo || 'https://api.dharaniherbbals.com/uploads/favicon_b04c8c6af4.png';
    const price = getCurrentPrice() || 0;
    
    return (
      <Helmet>
        <title>{`${productName} | Dharani Herbbals`}</title>
        <meta name="description" content={`${productDesc} Buy now with free delivery on orders above ₹5000.`} />
        <link rel="canonical" href={`https://dharaniherbbals.com/product/${id}`} />
        
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${productName} | Dharani Herbbals`} />
        <meta property="og:description" content={`${productDesc} 💰 ${price > 0 ? formatPrice(price) : 'Best Price'} ✅ Quality Assured ✅ Free Delivery`} />
        <meta property="og:image" content={productImage} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:url" content={`https://dharaniherbbals.com/product/${id}`} />
        <meta property="og:site_name" content="Dharani Herbbals" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${productName} | Dharani Herbbals`} />
        <meta name="twitter:description" content={`${productDesc} ${price > 0 ? `Price: ${formatPrice(price)}` : ''} • Quality Assured • Free Delivery`} />
        <meta name="twitter:image" content={productImage} />
      </Helmet>
    );
  };

  if (!product) {
    return (
      <div>
        {renderMetaTags()}
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p>The product you're looking for doesn't exist or has been removed.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {renderMetaTags()}
      <Header />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Layout: Product Image and Info First */}
          <div className="lg:hidden">
            {/* Product Image for Mobile */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-6">
              <div 
                ref={imageContainerRef}
                className="relative group bg-gradient-to-br from-gray-50 to-white p-6"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => zoomedImageRef.current?.classList.add('scale-110')}
                onMouseLeave={() => zoomedImageRef.current?.classList.remove('scale-110')}
              >
                {selectedImage ? (
                  <>
                    <img 
                      ref={zoomedImageRef}
                      src={selectedImage} 
                      alt={product.Name || product.name || product.title || 'Product'} 
                      className="w-full h-auto max-h-[300px] object-contain transition-all duration-500 rounded-2xl"
                    />
                  </>
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                        📷
                      </div>
                      <span className={`text-gray-500 text-sm font-medium ${isTamil ? 'tamil-text' : ''}`}>{translate('product.noImageAvailable')}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Product Gallery for Mobile */}
              {galleryImages && galleryImages.length > 0 && (
                <div className="p-4 bg-gray-50">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.photo && (
                      <div 
                        className={`w-12 h-12 rounded-lg border-2 cursor-pointer flex-shrink-0 ${selectedImage === product.photo ? 'border-primary' : 'border-gray-200'}`}
                        onClick={() => setSelectedImage(product.photo)}
                      >
                        <img 
                          src={product.photo} 
                          alt="Main product" 
                          className="w-full h-full object-contain rounded-md"
                          loading="lazy"
                        />
                      </div>
                    )}
                    {galleryImages.map((img, index) => {
                      if (img === product.photo) return null;
                      return (
                        <div 
                          key={index} 
                          className={`w-12 h-12 rounded-lg border-2 cursor-pointer flex-shrink-0 ${selectedImage === img ? 'border-primary' : 'border-gray-200'}`}
                          onClick={() => setSelectedImage(img)}
                        >
                          <img 
                            src={img} 
                            alt={`Product view ${index + 1}`} 
                            className="w-full h-full object-contain rounded-md"
                            loading="lazy"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Product Info for Mobile */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 mb-6">
              <div className="mb-4">
                <h1 className={`text-lg font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight uppercase ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil && product.tamil ? product.tamil : (product.Name || product.name || product.title || 'Product')}
                </h1>
                
                <div className="flex items-center mb-4">
                  <StarRating 
                    rating={reviewStats.average} 
                    count={reviewStats.count} 
                    size="sm" 
                    showCount={true} 
                  />
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-green-50 rounded-2xl border border-primary/10">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                    {formatPrice(getCurrentPrice())}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                {product.originalPrice && (
                  <div className="mt-2">
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                      Save {Math.round(((product.originalPrice - getCurrentPrice()) / product.originalPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>
              
              {/* Variable Product Options for Mobile */}
              {product.isVariableProduct && variations.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {product.attributeName || 'Options'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {variations.map((variation, index) => (
                      <button
                        key={index}
                        onClick={() => handleVariationChange(variation)}
                        className={`p-2 rounded-xl border-2 transition-all duration-300 text-left ${
                          selectedVariation === variation
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-xs">{variation.value || variation.name || variation.attributeValue}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatPrice(getPriceByUserType(variation, userType || 'customer'))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity Selector for Mobile */}
              <div className="mb-6">
                <label className={`block text-sm font-semibold text-gray-700 mb-2 ${isTamil ? 'tamil-text' : ''}`}>{translate('product.quantity')}</label>
                <div className="flex items-center bg-gray-50 rounded-2xl p-2 w-fit">
                  <button 
                    className="w-8 h-8 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center font-bold text-gray-600 hover:text-primary text-sm"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span className="px-4 py-1 font-bold text-base min-w-[50px] text-center">{quantity}</span>
                  <button 
                    className="w-8 h-8 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center font-bold text-gray-600 hover:text-primary text-sm"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Action Buttons for Mobile */}
              <div className="mb-6">
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 py-2.5 text-sm font-medium rounded-xl border border-gray-200"
                    style={{background: 'linear-gradient(to right, #e6e6e6, #f2f2f2)'}}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span className={`${isTamil ? 'tamil-text' : ''}`}>{translate('products.addToCart')}</span>
                  </Button>
                  
                  <Button 
                    className="flex-1 text-white shadow-md hover:shadow-lg transition-all duration-300 py-2.5 text-sm font-medium rounded-xl border border-green-400/20"
                    style={{background: 'linear-gradient(to right, #009108, #55bf57)'}}
                    onClick={handleBuyNow}
                  >
                    <span className={`${isTamil ? 'tamil-text' : ''}`}>{translate('product.buyNow')}</span>
                  </Button>
                </div>
                
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 shadow-md hover:shadow-lg transition-all duration-300 py-2.5 text-sm font-medium rounded-xl"
                    onClick={handleWishlistToggle}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : ''} `} />
                    <span className={`${isTamil ? 'tamil-text' : ''}`}>
                      {isInWishlist(product.id.toString()) ? translate('product.removeFromWishlist') : translate('product.addToWishlist')}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Product Description for Mobile */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center gap-2">
                <div className="w-5 h-5 bg-primary/10 rounded-lg flex items-center justify-center text-xs">
                  📝
                </div>
                <span className={`${isTamil ? 'tamil-text' : ''}`}>{translate('product.description')}</span>
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className={`text-gray-700 leading-relaxed text-sm ${isTamil ? 'tamil-text' : ''}`}>
                  {product.description || product.desc || (isTamil ? translate('product.noDescriptionAvailable') : 'No description available for this product.')}
                </p>
              </div>
            </div>
            
            {/* Reviews Section for Mobile */}
            <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-primary to-green-600 p-4 text-white">
                <h2 className={`text-xl font-bold ${isTamil ? 'tamil-text' : ''}`}>{translate('product.reviews')}</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <ProductReviews 
                      productId={product.id} 
                      skuId={product.skuid || product.SKUID || product.id.toString()} 
                      key={reviewsRefreshKey}
                    />
                  </div>
                  <div>
                    <ReviewForm 
                      productId={product.id} 
                      skuId={product.skuid || product.SKUID || product.id.toString()}
                      productName={product.Name || product.name || product.title || ''}
                      onReviewSubmitted={() => setReviewsRefreshKey(prev => prev + 1)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar - Now shows after product info on mobile */}
          <div className="lg:w-80 flex-shrink-0 order-last lg:order-first">
            <div className="sticky top-24 space-y-4">
              {/* Categories Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-green-600 p-4 text-white">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                    </div>
                    Categories
                  </h2>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    <li>
                      <Link to="/products" className="flex items-center px-3 py-2 rounded-xl hover:bg-primary/5 hover:text-primary transition-all duration-300 group">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-2 group-hover:bg-primary transition-colors"></div>
                        <span className="font-medium text-sm">All Categories</span>
                      </Link>
                    </li>
                    {allCategories.map(cat => (
                      <li key={cat}>
                        <Link
                          to={`/products?category=${encodeURIComponent(cat.trim())}`}
                          className={`flex items-center px-3 py-2 rounded-xl transition-all duration-300 group ${
                            product?.category?.trim().toUpperCase() === cat
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'hover:bg-primary/5 hover:text-primary'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-2 ${product?.category?.trim().toUpperCase() === cat ? 'bg-primary' : 'bg-gray-300 group-hover:bg-primary transition-colors'}`}></div>
                          <span className="font-medium text-sm">{cat}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Brands Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    Brands
                  </h2>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    <li>
                      <Link to="/products" className="flex items-center px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-2 group-hover:bg-blue-500 transition-colors"></div>
                        <span className="font-medium text-sm">All Brands</span>
                      </Link>
                    </li>
                    {allBrands.map(brand => (
                      <li key={brand}>
                        <Link
                          to={`/products?brand=${encodeURIComponent(brand)}`}
                          className={`flex items-center px-3 py-2 rounded-xl transition-all duration-300 group ${
                            product?.brand === brand
                              ? 'bg-blue-50 text-blue-600 font-semibold'
                              : 'hover:bg-blue-50 hover:text-blue-600'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-2 ${product?.brand === brand ? 'bg-blue-500' : 'bg-gray-300 group-hover:bg-blue-500 transition-colors'}`}></div>
                          <span className="font-medium text-sm">{brand}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Quick Actions Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 text-white">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-lg"></div>
                    </div>
                    Quick Actions
                  </h2>
                </div>
                <div className="p-4 space-y-3">
                  <Link 
                    to="/products" 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-green-50 hover:to-green-100 hover:text-green-600 transition-all duration-300 group"
                  >
                    <span className="font-medium text-sm">Browse All Products</span>
                    <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors text-xs">
                      →
                    </div>
                  </Link>
                  <Link 
                    to="/cart" 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-green-50 hover:to-green-100 hover:text-green-600 transition-all duration-300 group"
                  >
                    <span className="font-medium text-sm">View Cart</span>
                    <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors text-xs">
                      🛒
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Product Image - Desktop Only */}
          <div className="lg:w-1/2 hidden lg:block">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div 
                ref={imageContainerRef}
                className="relative group bg-gradient-to-br from-gray-50 to-white p-8"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => zoomedImageRef.current?.classList.add('scale-110')}
                onMouseLeave={() => zoomedImageRef.current?.classList.remove('scale-110')}
                onClick={() => setZoomActive(true)}
              >
                {selectedImage ? (
                  <>
                    <img 
                      ref={zoomedImageRef}
                      src={selectedImage} 
                      alt={product.Name || product.name || product.title || 'Product'} 
                      className="w-full h-auto max-h-[500px] object-contain cursor-zoom-in transition-all duration-500 rounded-2xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-2xl">
                      <div className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full text-gray-800 font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        🔍 {isTamil ? translate('product.clickToZoom') : 'Click to zoom'}
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 w-12 h-12 bg-primary/10 rounded-full blur-xl"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 bg-green-200/30 rounded-full blur-lg"></div>
                  </>
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                        📷
                      </div>
                      <span className={`text-gray-500 text-lg font-medium ${isTamil ? 'tamil-text' : ''}`}>{translate('product.noImageAvailable')}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Product Gallery */}
              {galleryImages && galleryImages.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Product Gallery</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {/* Main product image */}
                    {product.photo && (
                      <div 
                        className={`w-16 h-16 rounded-lg border-2 cursor-pointer flex-shrink-0 ${selectedImage === product.photo ? 'border-primary' : 'border-gray-200 hover:border-primary/50'}`}
                        onClick={() => setSelectedImage(product.photo)}
                      >
                        <img 
                          src={product.photo} 
                          alt="Main product" 
                          className="w-full h-full object-contain rounded-md"
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    {/* Gallery images - only show if they're different from the main image */}
                    {galleryImages.map((img, index) => {
                      // Skip if the gallery image is the same as the main product image
                      if (img === product.photo) return null;
                      
                      return (
                        <div 
                          key={index} 
                          className={`w-16 h-16 rounded-lg border-2 cursor-pointer flex-shrink-0 ${selectedImage === img ? 'border-primary' : 'border-gray-200 hover:border-primary/50'}`}
                          onClick={() => setSelectedImage(img)}
                        >
                          <img 
                            src={img} 
                            alt={`Product view ${index + 1}`} 
                            className="w-full h-full object-contain rounded-md"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100x100?text=Image';
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Product Description under image */}
              <div className="p-6 border-t border-gray-100">
                <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center gap-2">
                  <div className="w-5 h-5 bg-primary/10 rounded-lg flex items-center justify-center text-xs">
                    📝
                  </div>
                  <span className={`${isTamil ? 'tamil-text' : ''}`}>{translate('product.description')}</span>
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className={`text-gray-700 leading-relaxed text-sm ${isTamil ? 'tamil-text' : ''}`}>
                    {product.description || product.desc || (isTamil ? translate('product.noDescriptionAvailable') : 'No description available for this product.')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Zoom Modal */}
            {zoomActive && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
                onClick={() => setZoomActive(false)}
              >
                <div className="relative max-w-4xl max-h-full">
                  <button 
                    className="absolute top-2 right-2 bg-white rounded-full p-2 text-black"
                    onClick={() => setZoomActive(false)}
                  >
                    ✕
                  </button>
                  <img 
                    src={selectedImage || product.photo} 
                    alt={product.Name || product.name || product.title || 'Product'} 
                    className="max-w-full max-h-[90vh] object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Product Info - Desktop Only */}
          <div className="lg:w-1/2 hidden lg:block">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10">
              <div className="mb-6">
                <h1 className={`text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight uppercase ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil && product.tamil ? product.tamil : (product.Name || product.name || product.title || 'Product')}
                </h1>
                
                <div className="flex items-center mb-6">
                  <StarRating 
                    rating={reviewStats.average} 
                    count={reviewStats.count} 
                    size="md" 
                    showCount={true} 
                  />
                </div>
              </div>
              
              <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-green-50 rounded-2xl border border-primary/10">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                    {formatPrice(getCurrentPrice())}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                {product.originalPrice && (
                  <div className="mt-2">
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                      Save {Math.round(((product.originalPrice - getCurrentPrice()) / product.originalPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>
              
              {/* Variable Product Options */}
              {product.isVariableProduct && variations.length > 0 && (
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {product.attributeName || 'Options'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {variations.map((variation, index) => (
                      <button
                        key={index}
                        onClick={() => handleVariationChange(variation)}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 text-left ${
                          selectedVariation === variation
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{variation.value || variation.name || variation.attributeValue}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatPrice(getPriceByUserType(variation, userType || 'customer'))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            
            {/* Description moved to bottom */}
            
              {/* Enhanced Quantity Selector */}
              <div className="mb-8">
                <label className={`block text-sm font-semibold text-gray-700 mb-3 ${isTamil ? 'tamil-text' : ''}`}>{translate('product.quantity')}</label>
                <div className="flex items-center bg-gray-50 rounded-2xl p-2 w-fit">
                  <button 
                    className="w-10 h-10 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center font-bold text-gray-600 hover:text-primary"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-bold text-lg min-w-[60px] text-center">{quantity}</span>
                  <button 
                    className="w-10 h-10 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center font-bold text-gray-600 hover:text-primary"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Enhanced Action Buttons */}
              <div className="mb-8">
                <div className="flex gap-4">
                  <Button 
                    className="flex-1 text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 py-3 text-base font-medium rounded-xl border border-gray-200"
                    style={{background: 'linear-gradient(to right, #e6e6e6, #f2f2f2)'}}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    <span className={`${isTamil ? 'tamil-text' : ''}`}>{translate('products.addToCart')}</span>
                  </Button>
                  
                  <Button 
                    className="flex-1 text-white shadow-md hover:shadow-lg transition-all duration-300 py-3 text-base font-medium rounded-xl border border-green-400/20"
                    style={{background: 'linear-gradient(to right, #009108, #55bf57)'}}
                    onClick={handleBuyNow}
                  >
                    <span className={`${isTamil ? 'tamil-text' : ''}`}>{translate('product.buyNow')}</span>
                  </Button>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 shadow-md hover:shadow-lg transition-all duration-300 py-3 text-base font-medium rounded-xl"
                    onClick={handleWishlistToggle}
                  >
                    <Heart className={`mr-2 h-5 w-5 ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : ''} `} />
                    <span className={`${isTamil ? 'tamil-text' : ''}`}>
                      {isInWishlist(product.id.toString()) ? translate('product.removeFromWishlist') : translate('product.addToWishlist')}
                    </span>
                  </Button>
                </div>
              </div>
            
              {/* Enhanced Product Details */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                  <h2 className={`text-xl font-bold mb-4 text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>{translate('product.productDetails')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.brand && (
                      <div className="flex items-center p-3 bg-white rounded-xl shadow-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <div>
                          <span className={`text-xs text-gray-500 uppercase tracking-wide ${isTamil ? 'tamil-text' : ''}`}>{translate('product.brand')}</span>
                          <div className="font-semibold text-gray-800">{product.brand}</div>
                        </div>
                      </div>
                    )}
                    {product.category && (
                      <div className="flex items-center p-3 bg-white rounded-xl shadow-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <span className={`text-xs text-gray-500 uppercase tracking-wide ${isTamil ? 'tamil-text' : ''}`}>{translate('product.category')}</span>
                          <div className="font-semibold text-gray-800">{product.category}</div>
                        </div>
                      </div>
                    )}
                    {/* Show SKU for single products or the selected variation's SKU for variable products */}
                    {((product.skuid && !product.isVariableProduct) || (product.isVariableProduct && selectedVariation?.skuid)) && (
                      <div className="flex items-center p-3 bg-white rounded-xl shadow-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        <div>
                          <span className={`text-xs text-gray-500 uppercase tracking-wide ${isTamil ? 'tamil-text' : ''}`}>{translate('product.sku')}</span>
                          <div className="font-semibold text-gray-800">
                            {product.isVariableProduct && selectedVariation?.skuid ? selectedVariation.skuid : product.skuid}
                          </div>
                        </div>
                      </div>
                    )}
                    {product.hsn && (
                      <div className="flex items-center p-3 bg-white rounded-xl shadow-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        <div>
                          <span className={`text-xs text-gray-500 uppercase tracking-wide ${isTamil ? 'tamil-text' : ''}`}>{translate('product.hsn')}</span>
                          <div className="font-semibold text-gray-800">{product.hsn}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section - Desktop Only */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hidden lg:block">
          <div className="bg-gradient-to-r from-primary to-green-600 p-4 text-white">
            <h2 className={`text-xl font-bold ${isTamil ? 'tamil-text' : ''}`}>{translate('product.reviews')}</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProductReviews 
                  productId={product.id} 
                  skuId={product.skuid || product.SKUID || product.id.toString()} 
                  key={reviewsRefreshKey}
                />
              </div>
              <div>
                <ReviewForm 
                  productId={product.id} 
                  skuId={product.skuid || product.SKUID || product.id.toString()}
                  productName={product.Name || product.name || product.title || ''}
                  onReviewSubmitted={() => setReviewsRefreshKey(prev => prev + 1)}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 py-6 bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary to-emerald-400 blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-6">
                <h2 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-2 tracking-tight ${isTamil ? 'tamil-text' : ''}`}>
                  {translate('product.youMightAlsoLike')}
                </h2>
                <p className={`text-sm text-gray-500 max-w-xl mx-auto ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ? 'உங்கள் தேர்வுக்கு நிரப்பும் மேலும் தயாரிப்புகளைக் கண்டறியுங்கள்' : 'Discover more products that complement your selection'}
                </p>
                <div className="flex justify-center items-center gap-2 mt-3">
                  <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                  <div className="w-16 h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 rounded-full"></div>
                  <div className="w-8 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct, index) => {
                  const productImage = relatedProduct.photo || null;
                  
                  return (
                    <div 
                      key={relatedProduct.id} 
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <Link 
                        to={`/product/${relatedProduct.id}`} 
                        className="block group"
                        onClick={(e) => {
                          // If we're on the same page, prevent default and manually update state
                          if (relatedProduct.id.toString() === id) {
                            e.preventDefault();
                            return;
                          }
                          // Show loading state
                          setLoading(true);
                        }}
                      >
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative">
                          {/* Hover overlay effect */}
                          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300 z-10"></div>
                          
                          <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
                            {productImage ? (
                              <img 
                                src={productImage} 
                                alt={relatedProduct.name || 'Product'} 
                                className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <span className={`text-gray-400 text-sm ${isTamil ? 'tamil-text' : ''}`}>{translate('product.noImageAvailable')}</span>
                              </div>
                            )}
                            <div className="absolute top-2 right-2 w-8 h-8 bg-primary/10 rounded-full blur-lg group-hover:w-12 group-hover:h-12 transition-all duration-500"></div>
                          </div>
                          <div className="p-6 relative z-20">
                            <h3 className={`font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2 uppercase ${isTamil ? 'tamil-text' : ''}`}>
                              {isTamil && relatedProduct.tamil ? relatedProduct.tamil : (relatedProduct.name || 'Product')}
                            </h3>
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-bold text-primary group-hover:scale-105 origin-left transition-transform">
                                {relatedProduct.isVariableProduct && relatedProduct.variations ? 
                                  (() => {
                                    try {
                                      const variations = typeof relatedProduct.variations === 'string' ? JSON.parse(relatedProduct.variations) : relatedProduct.variations;
                                      const prices = variations.map(v => getPriceByUserType(v, userType)).filter(p => p > 0);
                                      if (prices.length === 0) return formatPrice(relatedProduct.mrp || 0);
                                      const minPrice = Math.min(...prices);
                                      const maxPrice = Math.max(...prices);
                                      return minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
                                    } catch {
                                      return formatPrice(getPriceByUserType(relatedProduct, userType));
                                    }
                                  })()
                                  : formatPrice(getPriceByUserType(relatedProduct, userType))
                                }
                              </p>
                              <StarRating 
                                rating={0} 
                                count={0} 
                                size="sm" 
                                showCount={false} 
                              />
                            </div>
                            
                            {/* Quick view button that appears on hover */}
                            <div className="mt-4 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <span className={`text-xs font-medium text-primary flex items-center justify-center ${isTamil ? 'tamil-text' : ''}`}>
                                {isTamil ? 'விவரங்களைக் காண்க' : 'View Details'} <span className="ml-1">→</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;