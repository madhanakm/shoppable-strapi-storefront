import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Filter, Grid, List, Star, Heart, Search, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlistContext } from '@/contexts/WishlistContext';
import { useQuickCheckout } from '@/contexts/QuickCheckoutContext';
import { formatPrice } from '@/lib/utils';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import { getBulkProductReviewStats } from '@/services/reviews';
import { getProducts } from '@/services/products';
import StarRating from '@/components/StarRating';
import { useAuth } from '@/contexts/AuthContext';
import { getPriceByUserType, getVariablePriceRange } from '@/lib/pricing';
import { CompactLoadingStatus } from '@/components/ProductSkeleton';

const AllProducts = () => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  const itemsPerPage = 12;
  const { language, translate } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const { user } = useAuth();
  const [userType, setUserType] = useState('customer');
  const [priceKey, setPriceKey] = useState(0);
  
  // Always fetch fresh user type from API
  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const response = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userData.id}`, {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
            }
          });
          if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.attributes) {
              const newUserType = result.data.attributes.userType || 'customer';
              
              setUserType(newUserType);
              setPriceKey(prev => prev + 1);
              return;
            }
          }
        }
        setUserType('customer');
      } catch (error) {
        
        setUserType('customer');
      }
    };
    fetchUserType();
  }, []);

  // Get URL parameters and reset pagination when they change
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const typeParam = searchParams.get('type');
    const searchParam = searchParams.get('search') || '';
    
    let hasChanges = false;
    
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
      hasChanges = true;
    }
    if (typeParam && typeParam !== selectedType) {
      setSelectedType(typeParam);
      hasChanges = true;
    }
    if (searchParam !== searchQuery) {
      setSearchQuery(searchParam);
      hasChanges = true;
    }
    
    if (hasChanges) {
      setPage(1);
      setHasMore(true);
    }
  }, [searchParams.toString()]);


  
  useEffect(() => {
    if (userType !== null) {
      const timeoutId = setTimeout(() => {
        loadData();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [userType, page, selectedCategory, selectedBrand, selectedType, searchQuery, sortBy]);

  useEffect(() => {
    loadCategoriesAndBrands();
  }, []);

  const loadCategoriesAndBrands = async () => {
    try {
      // Fetch brands directly from brands API
      const [brandsRes, categoriesRes] = await Promise.all([
        fetch(`https://api.dharaniherbbals.com/api/brands?fields[0]=name&fields[1]=Name&fields[2]=title&pagination[pageSize]=100`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
          }
        }),
        fetch(`https://api.dharaniherbbals.com/api/product-categories?fields[0]=name&fields[1]=Name&fields[2]=title&pagination[pageSize]=100`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
          }
        })
      ]);
      
      const [brandsData, categoriesData] = await Promise.all([
        brandsRes.ok ? brandsRes.json() : { data: [] },
        categoriesRes.ok ? categoriesRes.json() : { data: [] }
      ]);
      
      const brandNames = (brandsData.data || []).map(brand => {
        const attrs = brand.attributes || brand;
        return attrs.name || attrs.Name || attrs.title;
      }).filter(Boolean);
      
      const categoryNames = (categoriesData.data || []).map(cat => {
        const attrs = cat.attributes || cat;
        return attrs.name || attrs.Name || attrs.title;
      }).filter(Boolean);
      
      setBrands(brandNames);
      setCategories(categoryNames);
    } catch (error) {
      console.error('Failed to load categories and brands:', error);
    }
  };

  const loadData = async () => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const filters = {
        category: selectedCategory,
        brand: selectedBrand,
        type: selectedType,
        search: searchQuery
      };
      
      const sortOptions = { sortBy };
      
      const productsData = await getProducts(page, itemsPerPage, filters, { ...sortOptions, random: true });
      const productList = Array.isArray(productsData) ? productsData : productsData.data || [];
      
      if (page === 1) {
        setProducts(productList);
      } else {
        setProducts(prev => [...prev, ...productList]);
      }
      
      // Handle pagination metadata properly
      if (productsData.meta?.pagination) {
        setTotalProducts(productsData.meta.pagination.total);
        const currentTotal = page === 1 ? productList.length : products.length + productList.length;
        setHasMore(productList.length === itemsPerPage && currentTotal < productsData.meta.pagination.total);
      } else {
        setTotalProducts(productList.length);
        setHasMore(productList.length === itemsPerPage);
      }
      
      // Load reviews asynchronously without blocking UI
      const productIds = productList.map(p => p.id).filter(id => id && !isNaN(parseInt(id)));
      if (productIds.length > 0) {
        setTimeout(() => {
          getBulkProductReviewStats(productIds.map(id => parseInt(id)))
            .then(stats => setReviewStats(stats))
            .catch(() => {}); // Silently fail for reviews
        }, 100);
      }
      

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Products come pre-filtered and sorted from API - no client-side processing needed
  const displayedProducts = products;

  const handleWishlistToggle = (product) => {
    const productId = product.id.toString();

    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedType('all');
    setSearchQuery('');
    setPage(1);
    setHasMore(true);
    navigate('/products');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
    setHasMore(true);
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Header />
        <div className="flex justify-center py-16">
          <CompactLoadingStatus 
            message="Loading products..." 
            showProgress={false}
            size="lg"
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-x-hidden">
      <SEOHead 
        title={searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
        description={searchQuery ? `Found ${totalProducts} herbal products matching "${searchQuery}". Browse natural remedies and wellness products.` : 'Browse our complete collection of natural and herbal products. Premium quality Ayurvedic remedies and wellness solutions.'}
        url={searchQuery ? `/products?search=${encodeURIComponent(searchQuery)}` : '/products'}
      />
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-full">
        {/* Page Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent mb-3 md:mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-4">
            {searchQuery ? `Found ${totalProducts} products matching your search` : 'Discover our complete range of natural and herbal products for your wellness journey'}
          </p>
          {searchQuery && (
            <Button 
              onClick={clearSearch} 
              variant="outline" 
              className="mt-3 md:mt-4 border-primary text-primary hover:bg-primary/10 text-sm"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Search
            </Button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="w-full mb-4 border-2 border-primary/30 text-primary hover:bg-primary/5"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Sidebar Filters */}
          <div className={`w-full lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 sticky top-24 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-green-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xl flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters} 
                    className="text-white hover:bg-white/20 border border-white/30 rounded-lg"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="font-bold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">Categories</h3>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === 'all'}
                        onChange={() => { setSelectedCategory('all'); setPage(1); setHasMore(true); }}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className={`ml-3 text-sm font-medium group-hover:text-primary transition-colors ${
                        selectedCategory === 'all' ? 'text-primary font-semibold' : 'text-gray-700'
                      }`}>
                        All Categories
                      </span>
                    </label>
                    {categories.map((category, index) => (
                      <label key={index} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => { setSelectedCategory(category); setPage(1); setHasMore(true); }}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <span className={`ml-3 text-sm font-medium group-hover:text-primary transition-colors ${
                          selectedCategory === category ? 'text-primary font-semibold' : 'text-gray-700'
                        }`}>
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="font-bold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">Brands</h3>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrand === 'all'}
                        onChange={() => { setSelectedBrand('all'); setPage(1); setHasMore(true); }}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className={`ml-3 text-sm font-medium group-hover:text-primary transition-colors ${
                        selectedBrand === 'all' ? 'text-primary font-semibold' : 'text-gray-700'
                      }`}>
                        All Brands
                      </span>
                    </label>
                    {brands.map((brand, index) => (
                      <label key={index} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="brand"
                          checked={selectedBrand === brand}
                          onChange={() => { setSelectedBrand(brand); setPage(1); setHasMore(true); }}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <span className={`ml-3 text-sm font-medium group-hover:text-primary transition-colors ${
                          selectedBrand === brand ? 'text-primary font-semibold' : 'text-gray-700'
                        }`}>
                          {brand}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>



                {/* Product Types */}
                <div>
                  <h3 className="font-bold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">Product Types</h3>
                  <div className="space-y-3">
                    {['all', 'deals', 'trending', 'hot', 'popular'].map((type) => (
                      <label key={type} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="type"
                          checked={selectedType === type}
                          onChange={() => { setSelectedType(type); setPage(1); setHasMore(true); }}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <span className={`ml-3 text-sm font-medium capitalize group-hover:text-primary transition-colors ${
                          selectedType === type ? 'text-primary font-semibold' : 'text-gray-700'
                        }`}>
                          {type === 'all' ? 'All Types' : type}
                          {type !== 'all' && (
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              type === 'deals' ? 'bg-purple-100 text-purple-600' :
                              type === 'trending' ? 'bg-blue-100 text-blue-600' :
                              type === 'hot' ? 'bg-red-100 text-red-600' :
                              type === 'popular' ? 'bg-green-100 text-green-600' : ''
                            }`}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="text-gray-600 text-sm md:text-base">
                Showing {displayedProducts.length} of {totalProducts} products
              </div>
              
              <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none px-2 md:px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Grid className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <List className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {totalProducts === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div data-products-grid className={`grid gap-4 lg:gap-6 w-full ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {displayedProducts.map((product) => {
                  // Force re-render with priceKey
                  const attrs = product.attributes || product;
                  return (
                    <Card key={`${product.id}-${priceKey}`} className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 shadow-lg hover:-translate-y-2 w-full max-w-full">
                      <div className="relative overflow-hidden">
                        <Link to={`/product/${product.id}`} className="block cursor-pointer">
                          <img 
                            src={attrs.photo || attrs.image || '/placeholder.svg'} 
                            alt={attrs.Name || attrs.name || 'Product'} 
                            className="w-full aspect-square object-cover bg-white group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x300?text=Product';
                            }}
                          />
                        </Link>
                        
                        {/* Wishlist Button */}
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-lg"
                          onClick={() => handleWishlistToggle(product)}
                        >
                          <Heart className={`w-4 h-4 ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>

                        {/* Product Type Badge */}
                        {attrs.type && (
                          <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full text-white ${
                            attrs.type === 'deals' ? 'bg-purple-500' :
                            attrs.type === 'trending' ? 'bg-blue-500' :
                            attrs.type === 'hot' ? 'bg-red-500' :
                            attrs.type === 'popular' ? 'bg-green-500' : 'bg-gray-500'
                          }`}>
                            {attrs.type.charAt(0).toUpperCase() + attrs.type.slice(1)}
                          </span>
                        )}
                      </div>
                      
                      <CardContent className="p-4 md:p-6 bg-gradient-to-b from-white to-gray-50">
                        <Link to={`/product/${product.id}`}>
                          <h3 className={`font-semibold text-xs md:text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight uppercase ${isTamil ? 'tamil-text' : ''}`}>
                            {isTamil && attrs.tamil ? attrs.tamil : (attrs.Name || attrs.name || 'Product')}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center mb-2 md:mb-3">
                          <StarRating 
                            rating={reviewStats[product.id]?.average || 0} 
                            count={reviewStats[product.id]?.count || 0} 
                            size="sm" 
                            showCount={true} 
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                          <span className="text-base md:text-lg font-bold text-primary">
                            {(() => {
                              const currentUserType = userType || 'customer';
                              
                              if (attrs.isVariableProduct && attrs.variations) {
                                try {
                                  const variations = typeof attrs.variations === 'string' ? JSON.parse(attrs.variations) : attrs.variations;
                                  const priceRange = getVariablePriceRange(variations, currentUserType);
                                  if (!priceRange) return formatPrice(getPriceByUserType(attrs, currentUserType));
                                  return priceRange.minPrice === priceRange.maxPrice ? 
                                    formatPrice(priceRange.minPrice) : 
                                    `${formatPrice(priceRange.minPrice)} - ${formatPrice(priceRange.maxPrice)}`;
                                } catch {
                                  return formatPrice(getPriceByUserType(attrs, currentUserType));
                                }
                              } else {
                                const price = getPriceByUserType(attrs, currentUserType);
                                
                                return formatPrice(price);
                              }
                            })()
                            }
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-1.5 md:gap-2">
                          <div className="flex gap-1.5 md:gap-2">
                            <Button 
                              className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl py-1 md:py-1.5 text-[10px] md:text-xs font-medium" 
                              onClick={() => {
                                const productId = product.id.toString();
                                addToCart(productId, productId, 1);
                              }}
                            >
                              <ShoppingCart className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                              <span className={`${isTamil ? 'tamil-text text-[8px] md:text-[9px]' : 'text-[10px] md:text-xs'}`}>{translate('products.addToCart')}</span>
                            </Button>
                          </div>
                          
                          <Button 
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl py-1 md:py-1.5 text-[10px] md:text-xs font-medium" 
                            onClick={() => {
                              // For variable products, use the first variation
                              if (attrs.isVariableProduct && attrs.variations) {
                                try {
                                  const variations = typeof attrs.variations === 'string' ? JSON.parse(attrs.variations) : attrs.variations;
                                  if (variations && variations.length > 0) {
                                    const firstVariation = variations[0];
                                    setQuickCheckoutItem({
                                      id: product.id.toString(),
                                      name: `${attrs.Name || attrs.name} - ${firstVariation.attributeValue}`,
                                      tamil: attrs.tamil ? `${attrs.tamil} - ${firstVariation.attributeValue}` : null,
                                      price: getPriceByUserType(firstVariation, userType || 'customer'),
                                      image: attrs.photo || attrs.image,
                                      category: attrs.category,
                                      skuid: firstVariation.skuid || attrs.skuid || attrs.SKUID || product.id.toString(),
                                      variation: firstVariation.attributeValue,
                                      quantity: 1
                                    });
                                    navigate('/checkout');
                                    return;
                                  }
                                } catch (e) {
                                  
                                }
                              }
                              
                              // For regular products
                              setQuickCheckoutItem({
                                id: product.id.toString(),
                                name: attrs.Name || attrs.name,
                                tamil: attrs.tamil || null,
                                price: getPriceByUserType(attrs, userType || 'customer'),
                                image: attrs.photo || attrs.image,
                                category: attrs.category,
                                skuid: attrs.skuid || attrs.SKUID || product.id.toString(),
                                quantity: 1
                              });
                              navigate('/checkout');
                            }}
                          >
                            <span className={`${isTamil ? 'tamil-text text-[8px] md:text-[9px]' : 'text-[10px] md:text-xs'}`}>{translate('product.buyNow')}</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <Button 
                  size="lg"
                  data-load-more
                  onClick={() => {
                    const currentProducts = products.length;
                    setPage(p => p + 1);
                    
                    const checkForNewProducts = () => {
                      if (products.length > currentProducts) {
                        const productGrid = document.querySelector('[data-products-grid]');
                        const productCards = productGrid?.children;
                        if (productCards && productCards[currentProducts]) {
                          productCards[currentProducts].scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      } else {
                        setTimeout(checkForNewProducts, 100);
                      }
                    };
                    
                    setTimeout(checkForNewProducts, 100);
                  }}
                  disabled={loadingMore}
                  className="rounded-full bg-transparent border-2 border-primary text-primary hover:bg-primary/10 w-32 h-32 p-0 text-sm"
                >
                  {loadingMore ? '...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllProducts;