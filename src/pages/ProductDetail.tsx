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
import { useQuickCheckout } from '@/contexts/QuickCheckoutContext';
import { formatPrice } from '@/lib/utils';
import { getPriceByUserType } from '@/lib/pricing';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import ReviewForm from '@/components/ReviewForm';
import ProductReviews from '@/components/ProductReviews';
import StarRating from '@/components/StarRating';
import { getProductReviewStats } from '@/services/reviews';
import { ProductDetailSkeleton } from '@/components/ProductSkeleton';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [zoomActive, setZoomActive] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [variations, setVariations] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [userType, setUserType] = useState(null);
  
  // Refs for image zoom
  const imageContainerRef = useRef(null);
  const zoomedImageRef = useRef(null);

  // Always fetch fresh user type from API
  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const response = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userData.id}`);
          if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.attributes) {
              const newUserType = result.data.attributes.userType || 'customer';
              
              setUserType(newUserType);
            }
          }
        } else {
          setUserType('customer');
        }
      } catch (error) {
        
        setUserType('customer');
      }
    };
    
    fetchUserType();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading state when fetching new product
        
        // Reset gallery images and selected image when changing products
        setGalleryImages([]);
        setSelectedImage(null);
        setReviewStats({ average: 0, count: 0 });
        
        // Scroll to top when changing products
        window.scrollTo(0, 0);
        
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        
        // Fetch only the specific product
        const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters/${id}?timestamp=${timestamp}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
          }
        });
        const data = await response.json();
        
        // Get the product data
        const foundProduct = data.data || data;
        
        if (foundProduct) {
          // Format product data
          const productData = {
            id: foundProduct.id,
            ...foundProduct.attributes
          };
          
          setProduct(productData);
          
          // Handle variable products
          if (foundProduct.attributes?.isVariableProduct && foundProduct.attributes?.variations) {
            try {
              const variationsData = typeof foundProduct.attributes.variations === 'string' 
                ? JSON.parse(foundProduct.attributes.variations) 
                : foundProduct.attributes.variations;
              
              setVariations(variationsData || []);
              
              // Set first variation as default
              if (variationsData && variationsData.length > 0) {
                setSelectedVariation(variationsData[0]);
                // Use getPriceByUserType to get the correct price based on user type
                const firstVariationPrice = getPriceByUserType(variationsData[0], userType || 'customer');
                setCurrentPrice(firstVariationPrice);
              } else {
                setCurrentPrice(getPriceByUserType(foundProduct.attributes, userType || 'customer'));
              }
            } catch (e) {
              
              setCurrentPrice(foundProduct.attributes.mrp || foundProduct.attributes.price || 0);
            }
          } else {
            setCurrentPrice(getPriceByUserType(foundProduct.attributes, userType || 'customer'));
          }
          
          // Set gallery images if available
          if (foundProduct.attributes?.gallery && Array.isArray(foundProduct.attributes.gallery)) {
            setGalleryImages(foundProduct.attributes.gallery);
          } else if (foundProduct.attributes?.gallery && typeof foundProduct.attributes.gallery === 'string') {
            try {
              const parsedGallery = JSON.parse(foundProduct.attributes.gallery);
              if (Array.isArray(parsedGallery)) {
                setGalleryImages(parsedGallery);
              }
            } catch (e) {
              
            }
          } else {
            // If no gallery images, set empty array
            setGalleryImages([]);
          }
          
          // Load categories and brands with limited pagination
          const [categoriesRes, brandsRes] = await Promise.all([
            fetch(`https://api.dharaniherbbals.com/api/product-categories?pagination[pageSize]=100&timestamp=${timestamp}`, {
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
              }
            }),
            fetch(`https://api.dharaniherbbals.com/api/brands?pagination[pageSize]=100&timestamp=${timestamp}`, {
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
              }
            })
          ]);
          
          // Process categories
          if (categoriesRes.ok) {
            const categoriesData = await categoriesRes.json();
            let categoryNames = [];
            if (Array.isArray(categoriesData)) {
              categoryNames = categoriesData.map(cat => cat.name || cat.Name || cat.title || cat).filter(Boolean);
            } else if (categoriesData.data) {
              categoryNames = categoriesData.data.map(cat => {
                const attrs = cat.attributes || cat;
                return attrs.name || attrs.Name || attrs.title;
              }).filter(Boolean);
            }
            setCategories(categoryNames);
          }
          
          // Process brands
          if (brandsRes.ok) {
            const brandsData = await brandsRes.json();
            let brandNames = [];
            if (Array.isArray(brandsData)) {
              brandNames = brandsData.map(brand => brand.name || brand.Name || brand.title || brand).filter(Boolean);
            } else if (brandsData.data) {
              brandNames = brandsData.data.map(brand => {
                const attrs = brand.attributes || brand;
                return attrs.name || attrs.Name || attrs.title;
              }).filter(Boolean);
            }
            setBrands(brandNames);
          }
          
          // Fetch related products separately with filters
          const currentCategory = foundProduct.attributes?.category;
          const currentBrand = foundProduct.attributes?.brand;
          
          if (currentCategory || currentBrand) {
            let relatedFilters = 'filters[status][$eq]=true';
            if (currentCategory) {
              relatedFilters += `&filters[category][$eq]=${encodeURIComponent(currentCategory)}`;
            }
            if (currentBrand) {
              relatedFilters += `&filters[brand][$eq]=${encodeURIComponent(currentBrand)}`;
            }
            
            const relatedResponse = await fetch(`https://api.dharaniherbbals.com/api/product-masters?${relatedFilters}&pagination[pageSize]=5&timestamp=${timestamp}`, {
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
              }
            });
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              const relatedList = Array.isArray(relatedData) ? relatedData : relatedData.data || [];
              // Filter out current product and limit to 4
              const related = relatedList.filter(p => p.id !== foundProduct.id).slice(0, 4);
              setRelatedProducts(related);
            }
          }
          
          // Fetch review stats
          try {
            const skuId = foundProduct.attributes?.skuid || foundProduct.attributes?.SKUID || foundProduct.id.toString();
            // Ensure skuId is always a string
            const stats = await getProductReviewStats(foundProduct.id, skuId.toString());
            setReviewStats(stats);
          } catch (reviewError) {
            
          }
        }
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    if (id && userType !== null) {
      fetchData();
    }
  }, [id, userType]);
  
  // Update prices when userType changes
  useEffect(() => {
    if (product && userType !== null) {
      if (product.isVariableProduct && selectedVariation) {
        setCurrentPrice(getPriceByUserType(selectedVariation, userType || 'customer'));
      } else {
        setCurrentPrice(getPriceByUserType(product, userType || 'customer'));
      }
    }
  }, [userType, product, selectedVariation]);
  
  useEffect(() => {
    // Reset selected image and set the main product image as the selected image initially
    if (product) {
      // Reset selected image first
      setSelectedImage(null);
      
      // For variable products, use variation image if available
      if (selectedVariation && selectedVariation.image) {
        setSelectedImage(selectedVariation.image);
      } else if (product.photo) {
        setSelectedImage(product.photo);
      }
    }
  }, [product, selectedVariation]);
  
  const handleVariationChange = (variation) => {
    setSelectedVariation(variation);
    // Use getPriceByUserType to get the correct price based on user type
    setCurrentPrice(getPriceByUserType(variation, userType || 'customer'));
    
    // Update selected image if variation has an image
    if (variation.image) {
      setSelectedImage(variation.image);
    }
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
      let skuid, productId;
      
      if (product.isVariableProduct && selectedVariation) {
        skuid = selectedVariation.skuid || `${product.id}-${selectedVariation.value || selectedVariation.attributeValue}`;
        productId = product.id.toString();
      } else {
        skuid = product.skuid || product.SKUID || product.id.toString();
        productId = product.id.toString();
      }
      
      addToCart(skuid, productId, quantity);
    }
  };
  
  const handleBuyNow = () => {
    if (product) {
      // Clear any existing quick checkout data first
      setQuickCheckoutItem(null);
      
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
        price: currentPrice,
        image: selectedImage || product.photo || product.image,
        category: product.category,
        quantity: quantity
      };
      
      if (product.isVariableProduct && selectedVariation) {
        const variationName = selectedVariation.value || selectedVariation.attributeValue || Object.values(selectedVariation)[0];
        checkoutItem.variation = variationName;
        checkoutItem.name = `${checkoutItem.name} - ${variationName}`;
      }
      
      // Set the new quick checkout item
      setTimeout(() => {
        setQuickCheckoutItem(checkoutItem);
        navigate('/checkout');
      }, 10);
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    const skuid = (selectedVariation?.skuid || product.skuid || product.SKUID || product.id).toString();

    if (isInWishlist(skuid)) {
      removeFromWishlist(skuid);
    } else {
      addToWishlist(skuid);
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
    const price = currentPrice || 0;
    
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
          {/* Enhanced Sidebar */}
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
                      <Link 
                        to="/products"
                        className="flex items-center px-3 py-2 rounded-xl hover:bg-primary/5 hover:text-primary transition-all duration-300 group"
                      >
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-2 group-hover:bg-primary transition-colors"></div>
                        <span className={`font-medium text-sm ${isTamil ? 'tamil-text' : ''}`}>
                          All Categories
                        </span>
                      </Link>
                    </li>
                    {categories.map(category => (
                      <li key={category}>
                        <Link 
                          to={`/products?category=${encodeURIComponent(category)}`}
                          className={`flex items-center px-3 py-2 rounded-xl transition-all duration-300 group ${
                            product.category === category 
                              ? 'bg-primary/10 text-primary font-semibold' 
                              : 'hover:bg-primary/5 hover:text-primary'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-2 transition-colors ${
                            product.category === category ? 'bg-primary' : 'bg-gray-300 group-hover:bg-primary'
                          }`}></div>
                          <span className="font-medium text-sm">{category}</span>
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
                      <Link 
                        to="/products"
                        className="flex items-center px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group"
                      >
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-2 group-hover:bg-blue-500 transition-colors"></div>
                        <span className="font-medium text-sm">All Brands</span>
                      </Link>
                    </li>
                    {brands.map(brand => (
                      <li key={brand}>
                        <Link 
                          to={`/products?brand=${encodeURIComponent(brand)}`}
                          className={`flex items-center px-3 py-2 rounded-xl transition-all duration-300 group ${
                            product.brand === brand 
                              ? 'bg-blue-50 text-blue-600 font-semibold' 
                              : 'hover:bg-blue-50 hover:text-blue-600'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-2 transition-colors ${
                            product.brand === brand ? 'bg-blue-500' : 'bg-gray-300 group-hover:bg-blue-500'
                          }`}></div>
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
          
          {/* Enhanced Product Image */}
          <div className="lg:w-1/2">
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
          
          {/* Enhanced Product Info */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10">
              <div className="mb-6">
                <h1 className={`text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight ${isTamil ? 'tamil-text' : ''}`}>
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
                    {formatPrice(currentPrice)}
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
                      Save {Math.round(((product.originalPrice - currentPrice) / product.originalPrice) * 100)}%
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
                    className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-300 py-3 text-base font-medium rounded-xl border border-primary/20"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    <span className={`${isTamil ? 'tamil-text' : ''}`}>{translate('products.addToCart')}</span>
                  </Button>
                  
                  <Button 
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md hover:shadow-lg transition-all duration-300 py-3 text-base font-medium rounded-xl border border-red-400/20"
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
                    <Heart className={`mr-2 h-5 w-5 ${isInWishlist((selectedVariation?.skuid || product.skuid || product.SKUID || product.id).toString()) ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className={`${isTamil ? 'tamil-text' : ''}`}>
                      {isInWishlist((selectedVariation?.skuid || product.skuid || product.SKUID || product.id).toString()) ? translate('product.removeFromWishlist') : translate('product.addToWishlist')}
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
        
        {/* Reviews Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
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
          <div className="mt-20 py-12 bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary to-emerald-400 blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-12">
                <div className="flex flex-col items-center mb-8">
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl mb-6 transform hover:scale-110 hover:rotate-6 transition-all duration-500 relative cursor-pointer">
                    <div className="absolute inset-0 rounded-3xl bg-white/20 blur-xl"></div>
                    <div className="relative">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-4 tracking-tight ${isTamil ? 'tamil-text' : ''}`}>
                    {translate('product.youMightAlsoLike')}
                  </h2>
                  <p className={`text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                    {isTamil ? 'உங்கள் தேர்வுக்கு நிரப்பும் மேலும் தயாரிப்புகளைக் கண்டறியுங்கள்' : 'Discover more products that complement your selection'}
                  </p>
                  {loading && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-primary">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
                      <span className={`ml-2 text-sm font-medium ${isTamil ? 'tamil-text' : ''}`}>{translate('common.loading')}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-center items-center gap-2 mb-4">
                  <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                  <div className="w-16 h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 rounded-full"></div>
                  <div className="w-8 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct, index) => {
                  // Get the main product image
                  const productImage = relatedProduct.attributes?.photo || null;
                  
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
                          
                          <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white p-4">
                            {productImage ? (
                              <img 
                                src={productImage} 
                                alt={relatedProduct.attributes?.Name || 'Product'} 
                                className="w-full h-48 object-contain group-hover:scale-110 transition-transform duration-500 rounded-xl"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                                <span className={`text-gray-400 text-sm ${isTamil ? 'tamil-text' : ''}`}>{translate('product.noImageAvailable')}</span>
                              </div>
                            )}
                            <div className="absolute top-2 right-2 w-8 h-8 bg-primary/10 rounded-full blur-lg group-hover:w-12 group-hover:h-12 transition-all duration-500"></div>
                          </div>
                          <div className="p-6 relative z-20">
                            <h3 className={`font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2 ${isTamil ? 'tamil-text' : ''}`}>
                              {isTamil && relatedProduct.attributes?.tamil ? relatedProduct.attributes.tamil : (relatedProduct.attributes?.Name || 'Product')}
                            </h3>
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-bold text-primary group-hover:scale-105 origin-left transition-transform">
                                {relatedProduct.attributes?.isVariableProduct && relatedProduct.attributes?.variations ? 
                                  (() => {
                                    try {
                                      const variations = typeof relatedProduct.attributes.variations === 'string' ? JSON.parse(relatedProduct.attributes.variations) : relatedProduct.attributes.variations;
                                      const prices = variations.map(v => getPriceByUserType(v, userType)).filter(p => p > 0);
                                      if (prices.length === 0) return formatPrice(relatedProduct.attributes?.mrp || 0);
                                      const minPrice = Math.min(...prices);
                                      const maxPrice = Math.max(...prices);
                                      return minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
                                    } catch {
                                      return formatPrice(getPriceByUserType(relatedProduct.attributes, userType));
                                    }
                                  })()
                                  : formatPrice(getPriceByUserType(relatedProduct.attributes, userType))
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