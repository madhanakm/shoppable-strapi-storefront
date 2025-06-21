import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatPrice } from '@/lib/utils';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
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
        quantity
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
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar with Categories and Brands */}
          <div className="md:w-64 flex-shrink-0 order-last md:order-first">
            <div className="bg-gray-50 p-4 rounded-lg shadow mb-6">
              <h2 className="font-bold text-lg mb-4">Categories</h2>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/products"
                    className="block px-2 py-1 rounded hover:bg-gray-200"
                  >
                    All Categories
                  </a>
                </li>
                {categories.map(category => (
                  <li key={category}>
                    <a 
                      href={`/products?category=${encodeURIComponent(category)}`}
                      className={`block px-2 py-1 rounded hover:bg-gray-200 ${product.category === category ? 'font-bold text-primary' : ''}`}
                    >
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow mb-6">
              <h2 className="font-bold text-lg mb-4">Brands</h2>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/products"
                    className="block px-2 py-1 rounded hover:bg-gray-200"
                  >
                    All Brands
                  </a>
                </li>
                {brands.map(brand => (
                  <li key={brand}>
                    <a 
                      href={`/products?brand=${encodeURIComponent(brand)}`}
                      className={`block px-2 py-1 rounded hover:bg-gray-200 ${product.brand === brand ? 'font-bold text-primary' : ''}`}
                    >
                      {brand}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Product Image with Zoom */}
          <div className="md:w-1/3">
            <div 
              ref={imageContainerRef}
              className="bg-gray-100 rounded-lg overflow-hidden relative group max-w-md mx-auto"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => zoomedImageRef.current?.classList.add('scale-150')}
              onMouseLeave={() => zoomedImageRef.current?.classList.remove('scale-150')}
              onClick={() => setZoomActive(true)}
            >
              {product.photo ? (
                <>
                  <img 
                    ref={zoomedImageRef}
                    src={product.photo} 
                    alt={product.Name || product.name || product.title || 'Product'} 
                    className="w-full h-auto max-h-[400px] object-contain cursor-zoom-in transition-transform duration-200"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300">
                    <span className="text-white opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                      Click for fullscreen
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400 text-2xl">No image available</span>
                </div>
              )}
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
          
          {/* Product Info */}
          <div className="md:w-1/3">
            <h1 className="text-3xl font-bold mb-2">{product.Name || product.name || product.title || 'Product'}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${star <= (product.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">{product.reviews || 0} reviews</span>
            </div>
            
            <div className="mb-6">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.mrp || product.price || 0)}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through ml-2">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            
            {/* Description moved to bottom */}
            
            {/* Quantity Selector */}
            <div className="flex items-center mb-6">
              <span className="mr-4">Quantity:</span>
              <div className="flex items-center border rounded">
                <button 
                  className="px-3 py-1 border-r"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button 
                  className="px-3 py-1 border-l"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleWishlistToggle}
              >
                <Heart className={`mr-2 h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
            
            {/* Product Details */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Product Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {product.brand && (
                  <div>
                    <span className="font-semibold">Brand:</span> {product.brand}
                  </div>
                )}
                {product.category && (
                  <div>
                    <span className="font-semibold">Category:</span> {product.category}
                  </div>
                )}
                {product.skuid && (
                  <div>
                    <span className="font-semibold">SKU:</span> {product.skuid}
                  </div>
                )}
                {product.hsn && (
                  <div>
                    <span className="font-semibold">HSN:</span> {product.hsn}
                  </div>
                )}
              </div>
              
              {/* Product Description */}
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Product Description</h3>
                <p className="text-gray-700">{product.description || product.desc || 'No description available.'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <a 
                  href={`/product/${relatedProduct.id}`} 
                  key={relatedProduct.id}
                  className="block group"
                >
                  <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square mb-3">
                    {relatedProduct.attributes?.photo ? (
                      <img 
                        src={relatedProduct.attributes.photo} 
                        alt={relatedProduct.attributes?.Name || 'Product'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {relatedProduct.attributes?.Name || 'Product'}
                  </h3>
                  <p className="font-bold mt-1">{formatPrice(relatedProduct.attributes?.mrp || 0)}</p>
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