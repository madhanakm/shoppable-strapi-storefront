import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Filter, Grid, List, Star, Heart, Search, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useQuickCheckout } from '@/contexts/QuickCheckoutContext';
import { formatPrice } from '@/lib/utils';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import { getBulkProductReviewStats } from '@/services/reviews';
import StarRating from '@/components/StarRating';
import { useAuth } from '@/contexts/AuthContext';
import { getPriceByUserType, getVariablePriceRange } from '@/lib/pricing';
import { CompactLoadingStatus } from '@/components/ProductSkeleton';
import { useLoadingProgress, LOADING_CONFIGS } from '@/hooks/use-loading-progress';

const AllProducts = () => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [loading, setLoading] = useState(true);
  const loadingProgress = useLoadingProgress(LOADING_CONFIGS.ALL_PRODUCTS, false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12; // Show 12 products per page
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



  // Get URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const typeParam = searchParams.get('type');
    const searchParam = searchParams.get('search');
    if (categoryParam) setSelectedCategory(categoryParam);
    if (typeParam) setSelectedType(typeParam);
    if (searchParam) setSearchQuery(searchParam);
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [userType]);

  const loadData = async () => {
    setLoading(true);
    loadingProgress.startLoading();
    
    try {
      loadingProgress.setCurrentItem('Initializing product catalog...');
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      
      // Fetch all products by making multiple requests if needed
      let allProducts = [];
      let page = 1;
      let hasMore = true;
      
      loadingProgress.setManualStep(2, 20);
      loadingProgress.setCurrentItem('Fetching product data...');
      
      while (hasMore) {
        loadingProgress.setCurrentItem(`Loading page ${page} of products...`);
        
        const productsRes = await fetch(`https://api.dharaniherbbals.com/api/product-masters?pagination[page]=${page}&pagination[pageSize]=100&timestamp=${timestamp}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
          }
        });
        
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          const productList = Array.isArray(productsData) ? productsData : productsData.data || [];
          
          if (productList.length === 0) {
            hasMore = false;
          } else {
            allProducts = [...allProducts, ...productList];
            loadingProgress.addLog(`Loaded page ${page} with ${productList.length} products`);
            page++;
            // Safety check to prevent infinite loop
            if (page > 50) {
              hasMore = false;
              loadingProgress.addWarning('Reached maximum page limit (50)');
            }
          }
        } else {
          loadingProgress.addError(`Failed to fetch page ${page}: ${productsRes.status}`);
          hasMore = false;
        }
      }
      
      loadingProgress.setTotalItems(allProducts.length);
      loadingProgress.setManualStep(3, 60);
      loadingProgress.setCurrentItem('Processing product information...');
      loadingProgress.addLog(`Total products loaded: ${allProducts.length}`);
      setProducts(allProducts);
      
      // Load categories and brands
      loadingProgress.setCurrentItem('Loading categories and brands...');
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch(`https://api.dharaniherbbals.com/api/product-categories?pagination[pageSize]=1000&timestamp=${timestamp}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
          }
        }),
        fetch(`https://api.dharaniherbbals.com/api/brands?pagination[pageSize]=1000&timestamp=${timestamp}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
          }
        })
      ]);

      // Fetch review stats for all products
      loadingProgress.setManualStep(4, 80);
      loadingProgress.setCurrentItem('Loading product reviews...');
      const productIds = allProducts.map(p => p.id).filter(id => id && !isNaN(parseInt(id)));
      if (productIds.length > 0) {
        try {
          const stats = await getBulkProductReviewStats(productIds.map(id => parseInt(id)));
          setReviewStats(stats);
          loadingProgress.addLog(`Loaded reviews for ${Object.keys(stats).length} products`);
        } catch (reviewError) {
          loadingProgress.addWarning('Failed to load product reviews');
        }
      }

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
        setCategories(categoryNames.length > 0 ? categoryNames : ['Hair Care', 'Skin Care', 'Herbal', 'Ayurvedic']);
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
        setBrands(brandNames.length > 0 ? brandNames : ['Dharani', 'Ayush', 'Patanjali', 'Himalaya']);
      }
    } catch (error) {
      loadingProgress.addError(`Failed to load data: ${error.message}`);
    } finally {
      loadingProgress.stopLoading();
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const attrs = product.attributes || product;
    const status = attrs.status === true || attrs.status === 'true';
    const matchesCategory = selectedCategory === 'all' || attrs.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || attrs.brand === selectedBrand;
    const matchesType = selectedType === 'all' || attrs.type?.toLowerCase() === selectedType.toLowerCase();
    const matchesSearch = !searchQuery || (attrs.Name || attrs.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return status && matchesCategory && matchesBrand && matchesType && matchesSearch;
  }).sort((a, b) => {
    const aAttrs = a.attributes || a;
    const bAttrs = b.attributes || b;
    
    switch (sortBy) {
      case 'price-low':
        return (parseFloat(aAttrs.mrp) || 0) - (parseFloat(bAttrs.mrp) || 0);
      case 'price-high':
        return (parseFloat(bAttrs.mrp) || 0) - (parseFloat(aAttrs.mrp) || 0);
      case 'name':
      default:
        return (aAttrs.Name || aAttrs.name || '').localeCompare(bAttrs.Name || bAttrs.name || '');
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleWishlistToggle = (product) => {
    const attrs = product.attributes || product;
    const productData = {
      id: product.id.toString(),
      name: attrs.Name || attrs.name,
      tamil: attrs.tamil || null,
      price: getPriceByUserType(attrs, userType || 'customer'),
      image: attrs.photo || attrs.image,
      category: attrs.category
    };

    if (isInWishlist(productData.id)) {
      removeFromWishlist(productData.id);
    } else {
      addToWishlist(productData);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedType('all');
    setSearchQuery('');
    setPage(1);
    // Clear URL search params
    window.history.replaceState({}, '', '/products');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
    // Clear URL search params
    window.history.replaceState({}, '', '/products');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-8 md:py-16">
          {/* Page Header Skeleton */}
          <div className="text-center mb-12">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Skeleton */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 sticky top-24 overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-16 bg-gradient-to-r from-gray-300 to-gray-400"></div>
                  <div className="p-6 space-y-6">
                    {/* Categories Skeleton */}
                    <div>
                      <div className="h-6 bg-gray-300 rounded w-24 mb-4"></div>
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center">
                            <div className="w-4 h-4 bg-gray-200 rounded-full mr-3"></div>
                            <div className="h-4 bg-gray-200 rounded flex-1"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Brands Skeleton */}
                    <div>
                      <div className="h-6 bg-gray-300 rounded w-20 mb-4"></div>
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex items-center">
                            <div className="w-4 h-4 bg-gray-200 rounded-full mr-3"></div>
                            <div className="h-4 bg-gray-200 rounded flex-1"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section Skeleton */}
            <div className="flex-1">
              {/* Toolbar Skeleton */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="flex items-center gap-4 animate-pulse">
                  <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
                </div>
              </div>

              {/* Simple Loading Status */}
              <div className="flex justify-center py-8">
                <CompactLoadingStatus 
                  message="Loading products..." 
                  showProgress={false}
                  size="lg"
                />
              </div>

              {/* Products Grid Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                      <div className="relative">
                        <div className="w-full h-64 bg-gray-200"></div>
                        <div className="absolute top-3 right-3 w-12 h-6 bg-gray-300 rounded-2xl"></div>
                      </div>
                      <div className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="flex items-center mb-3">
                          {[...Array(5)].map((_, j) => (
                            <div key={j} className="w-4 h-4 bg-gray-200 rounded-full mr-1"></div>
                          ))}
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20 mb-3"></div>
                        <div className="space-y-2">
                          <div className="h-8 bg-gray-200 rounded-xl"></div>
                          <div className="h-8 bg-gray-200 rounded-xl"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {searchQuery ? `Found ${filteredProducts.length} products matching your search` : 'Discover our complete range of natural and herbal products for your wellness journey'}
          </p>
          {searchQuery && (
            <Button 
              onClick={clearSearch} 
              variant="outline" 
              className="mt-4 border-primary text-primary hover:bg-primary/10"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Search
            </Button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
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
          <div className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
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
                        onChange={() => { setSelectedCategory('all'); setPage(1); }}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className={`ml-3 text-sm font-medium group-hover:text-primary transition-colors ${
                        selectedCategory === 'all' ? 'text-primary font-semibold' : 'text-gray-700'
                      }`}>
                        All Categories <span className="text-xs text-gray-500">({products.filter(p => (p.attributes || p).status === true || (p.attributes || p).status === 'true').length})</span>
                      </span>
                    </label>
                    {categories.map((category, index) => {
                      const count = products.filter(p => {
                        const attrs = p.attributes || p;
                        return attrs.category === category && (attrs.status === true || attrs.status === 'true');
                      }).length;
                      return (
                        <label key={index} className="flex items-center cursor-pointer group">
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === category}
                            onChange={() => { setSelectedCategory(category); setPage(1); }}
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                          />
                          <span className={`ml-3 text-sm font-medium group-hover:text-primary transition-colors ${
                            selectedCategory === category ? 'text-primary font-semibold' : 'text-gray-700'
                          }`}>
                            {category} <span className="text-xs text-gray-500">({count})</span>
                          </span>
                        </label>
                      );
                    })}
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
                        onChange={() => { setSelectedBrand('all'); setPage(1); }}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className={`ml-3 text-sm font-medium group-hover:text-primary transition-colors ${
                        selectedBrand === 'all' ? 'text-primary font-semibold' : 'text-gray-700'
                      }`}>
                        All Brands
                      </span>
                    </label>
                    {brands.map((brand, index) => {
                      const count = products.filter(p => {
                        const attrs = p.attributes || p;
                        return attrs.brand === brand && (attrs.status === true || attrs.status === 'true');
                      }).length;
                      return (
                        <label key={index} className="flex items-center cursor-pointer group">
                          <input
                            type="radio"
                            name="brand"
                            checked={selectedBrand === brand}
                            onChange={() => { setSelectedBrand(brand); setPage(1); }}
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                          />
                          <span className={`ml-3 text-sm font-medium group-hover:text-primary transition-colors ${
                            selectedBrand === brand ? 'text-primary font-semibold' : 'text-gray-700'
                          }`}>
                            {brand} <span className="text-xs text-gray-500">({count})</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Product Types */}
                <div>
                  <h3 className="font-bold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">Product Types</h3>
                  <div className="space-y-3">
                    {['all', 'deals', 'trending', 'hot', 'popular'].map((type) => {
                      const count = type === 'all' ? 
                        products.filter(p => (p.attributes || p).status === true || (p.attributes || p).status === 'true').length :
                        products.filter(p => {
                          const attrs = p.attributes || p;
                          return (attrs.type?.toLowerCase() === type.toLowerCase()) && 
                                 (attrs.status === true || attrs.status === 'true');
                        }).length;
                      return (
                        <label key={type} className="flex items-center cursor-pointer group">
                          <input
                            type="radio"
                            name="type"
                            checked={selectedType === type}
                            onChange={() => { setSelectedType(type); setPage(1); }}
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
                            <span className="text-xs text-gray-500 ml-1">({count})</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="text-gray-600">
                Showing {displayedProducts.length} of {filteredProducts.length} products
              </div>
              
              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
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
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {displayedProducts.map((product) => {
                  // Force re-render with priceKey
                  const attrs = product.attributes || product;
                  return (
                    <Card key={`${product.id}-${priceKey}`} className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 shadow-lg hover:-translate-y-2">
                      <div className="relative overflow-hidden">
                        <Link to={`/product/${product.id}`} className="block cursor-pointer">
                          <img 
                            src={attrs.photo || attrs.image || '/placeholder.svg'} 
                            alt={attrs.Name || attrs.name || 'Product'} 
                            className="w-full h-64 object-contain bg-white group-hover:scale-105 transition-transform duration-500 p-4"
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
                      
                      <CardContent className="p-6 bg-gradient-to-b from-white to-gray-50">
                        <Link to={`/product/${product.id}`}>
                          <h3 className={`font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2 ${isTamil ? 'tamil-text' : ''}`}>
                            {isTamil && attrs.tamil ? attrs.tamil : (attrs.Name || attrs.name || 'Product')}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center mb-3">
                          <StarRating 
                            rating={reviewStats[product.id]?.average || 0} 
                            count={reviewStats[product.id]?.count || 0} 
                            size="sm" 
                            showCount={true} 
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-primary">
                            {(() => {
                              const currentUserType = userType || 'customer';
                              
                              // Product attrs has properties like:
                              // customerprice, resellerprice, retailprice, distributiorprice, sarvoprice, drug
                              
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
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl py-1.5 text-xs font-medium" 
                              onClick={() => {
                                // For variable products, use the first variation
                                if (attrs.isVariableProduct && attrs.variations) {
                                  try {
                                    const variations = typeof attrs.variations === 'string' ? JSON.parse(attrs.variations) : attrs.variations;
                                    if (variations && variations.length > 0) {
                                      const firstVariation = variations[0];
                                      addToCart({
                                        id: product.id.toString(),
                                        name: `${attrs.Name || attrs.name} - ${firstVariation.attributeValue}`,
                                        tamil: attrs.tamil ? `${attrs.tamil} - ${firstVariation.attributeValue}` : null,
                                        price: getPriceByUserType(firstVariation, userType || 'customer'),
                                        image: attrs.photo || attrs.image,
                                        category: attrs.category,
                                        skuid: firstVariation.skuid || attrs.skuid || attrs.SKUID || product.id.toString(),
                                        variation: firstVariation.attributeValue
                                      });
                                      return;
                                    }
                                  } catch (e) {
                                    
                                  }
                                }
                                
                                // For regular products
                                addToCart({
                                  id: product.id.toString(),
                                  name: attrs.Name || attrs.name,
                                  tamil: attrs.tamil || null,
                                  price: getPriceByUserType(attrs, userType || 'customer'),
                                  image: attrs.photo || attrs.image,
                                  category: attrs.category,
                                  skuid: attrs.skuid || attrs.SKUID || product.id.toString()
                                });
                              }}
                            >
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              <span className={`${isTamil ? 'tamil-text text-[9px]' : 'text-xs'}`}>{translate('products.addToCart')}</span>
                            </Button>
                          </div>
                          
                          <Button 
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl py-1.5 text-xs font-medium" 
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
                            <span className={`${isTamil ? 'tamil-text text-[9px]' : 'text-xs'}`}>{translate('product.buyNow')}</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    className="border-2 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const maxVisible = 10;
                      const startPage = Math.max(1, page - Math.floor(maxVisible / 2));
                      const endPage = Math.min(totalPages, startPage + maxVisible - 1);
                      const pages = [];
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(i);
                      }
                      
                      return pages.map((pageNum) => (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          onClick={() => setPage(pageNum)}
                          className={page === pageNum ? "bg-primary" : "border-primary/30 text-primary hover:bg-primary/5"}
                        >
                          {pageNum}
                        </Button>
                      ));
                    })()
                    }
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                    className="border-2 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    Next
                  </Button>
                </div>
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