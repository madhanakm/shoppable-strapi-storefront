import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatPrice } from '@/lib/utils';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [zoomActive, setZoomActive] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Refs for image zoom
  const imageContainerRef = useRef(null);
  const zoomedImageRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all products
        const response = await fetch('https://api.dharaniherbbals.com/api/product-masters');
        const data = await response.json();
        
        // Process products
        let productArray = [];
        if (data && data.data && Array.isArray(data.data)) {
          productArray = data.data;
        } else if (Array.isArray(data)) {
          productArray = data;
        }
        
        // Find current product
        const foundProduct = productArray.find(p => p.id.toString() === id);
        
        if (foundProduct) {
          // Format product data
          const productData = {
            id: foundProduct.id,
            ...foundProduct.attributes
          };
          
          setProduct(productData);
          
          // Extract categories and brands
          const uniqueCategories = [...new Set(
            productArray
              .map(p => p.attributes?.category)
              .filter(Boolean)
          )];
          
          const uniqueBrands = [...new Set(
            productArray
              .map(p => p.attributes?.brand)
              .filter(Boolean)
          )];
          
          setCategories(uniqueCategories);
          setBrands(uniqueBrands);
          
          // Find related products (same category or brand)
          const currentCategory = foundProduct.attributes?.category;
          const currentBrand = foundProduct.attributes?.brand;
          
          const related = productArray
            .filter(p => 
              p.id !== foundProduct.id && 
              (p.attributes?.category === currentCategory || 
               p.attributes?.brand === currentBrand)
            )
            .slice(0, 4); // Limit to 4 related products
          
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

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
      addToCart({
        id: product.id,
        name: product.Name || product.name || product.title,
        price: product.mrp || product.price,
        image: product.photo || product.image,
        category: product.category,
        skuid: product.skuid || product.SKUID || product.id.toString()
      });
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    const productData = {
      id: product.id,
      name: product.Name || product.name || product.title,
      price: product.mrp || product.price,
      image: product.photo || product.image
    };

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(productData);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading product...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div>
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
                    {translate('sidebar.categories')}
                  </h2>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="/products"
                        className="flex items-center px-3 py-2 rounded-xl hover:bg-primary/5 hover:text-primary transition-all duration-300 group"
                      >
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-2 group-hover:bg-primary transition-colors"></div>
                        <span className={`font-medium text-sm ${isTamil ? 'tamil-text' : ''}`}>
                          {translate('sidebar.allCategories')}
                        </span>
                      </a>
                    </li>
                    {categories.map(category => (
                      <li key={category}>
                        <a 
                          href={`/products?category=${encodeURIComponent(category)}`}
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
                        </a>
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
                    {translate('sidebar.brands')}
                  </h2>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="/products"
                        className="flex items-center px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group"
                      >
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-2 group-hover:bg-blue-500 transition-colors"></div>
                        <span className="font-medium text-sm">All Brands</span>
                      </a>
                    </li>
                    {brands.map(brand => (
                      <li key={brand}>
                        <a 
                          href={`/products?brand=${encodeURIComponent(brand)}`}
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
                        </a>
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
                    {translate('sidebar.quickActions')}
                  </h2>
                </div>
                <div className="p-4 space-y-3">
                  <a 
                    href="/products" 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-green-50 hover:to-green-100 hover:text-green-600 transition-all duration-300 group"
                  >
                    <span className="font-medium text-sm">Browse All Products</span>
                    <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors text-xs">
                      →
                    </div>
                  </a>
                  <a 
                    href="/cart" 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-green-50 hover:to-green-100 hover:text-green-600 transition-all duration-300 group"
                  >
                    <span className="font-medium text-sm">View Cart</span>
                    <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors text-xs">
                      🛒
                    </div>
                  </a>
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
                {product.photo ? (
                  <>
                    <img 
                      ref={zoomedImageRef}
                      src={product.photo} 
                      alt={product.Name || product.name || product.title || 'Product'} 
                      className="w-full h-auto max-h-[500px] object-contain cursor-zoom-in transition-all duration-500 rounded-2xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-2xl">
                      <div className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full text-gray-800 font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        🔍 Click to zoom
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
                      <span className="text-gray-500 text-lg font-medium">No image available</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Product Description under image */}
              <div className="p-6 border-t border-gray-100">
                <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center gap-2">
                  <div className="w-5 h-5 bg-primary/10 rounded-lg flex items-center justify-center text-xs">
                    📝
                  </div>
                  Description
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {product.description || product.desc || 'No description available for this product.'}
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
                    src={product.photo} 
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
                <h1 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
                  {product.Name || product.name || product.title || 'Product'}
                </h1>
                
                <div className="flex items-center mb-6">
                  <div className="flex mr-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-5 w-5 ${star <= (product.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
                    {product.reviews || 0} reviews
                  </span>
                </div>
              </div>
              
              <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-green-50 rounded-2xl border border-primary/10">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                    {formatPrice(product.mrp || product.price || 0)}
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
                      Save {Math.round(((product.originalPrice - (product.mrp || product.price)) / product.originalPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            
            {/* Description moved to bottom */}
            
              {/* Enhanced Quantity Selector */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
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
              <div className="space-y-4 mb-8">
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-500 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 py-4 text-lg font-semibold rounded-2xl"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-3 h-6 w-6" />
                  Add to Cart
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 py-4 text-lg font-semibold rounded-2xl"
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`mr-3 h-6 w-6 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
              </div>
            
              {/* Enhanced Product Details */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Product Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.brand && (
                      <div className="flex items-center p-3 bg-white rounded-xl shadow-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Brand</span>
                          <div className="font-semibold text-gray-800">{product.brand}</div>
                        </div>
                      </div>
                    )}
                    {product.category && (
                      <div className="flex items-center p-3 bg-white rounded-xl shadow-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Category</span>
                          <div className="font-semibold text-gray-800">{product.category}</div>
                        </div>
                      </div>
                    )}
                    {product.skuid && (
                      <div className="flex items-center p-3 bg-white rounded-xl shadow-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">SKU</span>
                          <div className="font-semibold text-gray-800">{product.skuid}</div>
                        </div>
                      </div>
                    )}
                    {product.hsn && (
                      <div className="flex items-center p-3 bg-white rounded-xl shadow-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">HSN</span>
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
        
        {/* Enhanced Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                You Might Also Like
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-green-600 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <a 
                  href={`/product/${relatedProduct.id}`} 
                  key={relatedProduct.id}
                  className="block group"
                >
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white p-4">
                      {relatedProduct.attributes?.photo ? (
                        <img 
                          src={relatedProduct.attributes.photo} 
                          alt={relatedProduct.attributes?.Name || 'Product'} 
                          className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-500 rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 w-8 h-8 bg-primary/10 rounded-full blur-lg"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {relatedProduct.attributes?.Name || 'Product'}
                      </h3>
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(relatedProduct.attributes?.mrp || 0)}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;