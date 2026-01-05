import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Filter, Grid, List, Heart, Search, X, CreditCard } from 'lucide-react';
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
import FloatingCart from '@/components/FloatingCart';

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
      
      if (productsData.meta?.pagination) {
        setTotalProducts(productsData.meta.pagination.total);
        const currentTotal = page === 1 ? productList.length : products.length + productList.length;
        setHasMore(productList.length === itemsPerPage && currentTotal < productsData.meta.pagination.total);
      } else {
        setTotalProducts(productList.length);
        setHasMore(productList.length === itemsPerPage);
      }
      
      const productIds = productList.map(p => p.id).filter(id => id && !isNaN(parseInt(id)));
      if (productIds.length > 0) {
        setTimeout(() => {
          getBulkProductReviewStats(productIds.map(id => parseInt(id)))
            .then(stats => setReviewStats(stats))
            .catch(() => {});
        }, 100);
      }

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

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
    <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-x-hidden">
      <SEOHead 
        title={searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
        description={searchQuery ? `Found ${totalProducts} herbal products matching "${searchQuery}". Browse natural remedies and wellness products.` : 'Browse our complete collection of natural and herbal products. Premium quality Ayurvedic remedies and wellness solutions.'}
        url={searchQuery ? `/products?search=${encodeURIComponent(searchQuery)}` : '/products'}
      />
      <Header />
      
      <div className="relative bg-gradient-to-r from-primary via-green-600 to-emerald-600 text-white py-8 md:py-12 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight">
              {searchQuery ? (
                <>
                  Search Results for <span className="text-yellow-300">"{searchQuery}"</span>
                </>
              ) : (
                <>Premium Wellness <span className="text-yellow-300">Collection</span></>
              )}
            </h1>
            <p className="text-sm md:text-base text-green-100 mb-4 md:mb-6">
              {searchQuery ? `Found ${totalProducts} products` : 'Discover curated herbal remedies and natural wellness solutions'}
            </p>
            {searchQuery && (
              <Button 
                onClick={clearSearch} 
                variant="secondary" 
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300 rounded-full px-4 py-2 text-sm"
              >
                <X className="w-3 h-3 mr-1" />
                Clear Search
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-full">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
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

          <div className={`w-full lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 sticky top-20 overflow-hidden z-40">
              <div className="bg-gradient-to-r from-primary via-green-600 to-emerald-600 p-6 text-white relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
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

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
              <div className="text-gray-600 text-xs md:text-sm">
                Showing {displayedProducts.length} of {totalProducts} products
              </div>
              
              <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none px-2 md:px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

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
                  const attrs = product.attributes || product;
                  return (
                    <Card key={`${product.id}-${priceKey}`} className="group hover:shadow-xl transition-all duration-200 overflow-hidden border-0 shadow-md hover:-translate-y-1 w-full max-w-full bg-white rounded-2xl">
                      <div className="relative overflow-hidden rounded-t-3xl">
                        <Link to={`/product/${product.id}`} className="block cursor-pointer">
                          <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
                            <img 
                              src={attrs.photo || attrs.image || '/placeholder.svg'} 
                              alt={attrs.Name || attrs.name || 'Product'} 
                              className="w-full aspect-square object-cover bg-white group-hover:scale-102 transition-transform duration-200"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x300?text=Product';
                              }}
                            />
                          </div>
                        </Link>
                        
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full shadow-md"
                          onClick={() => handleWishlistToggle(product)}
                        >
                          <Heart className={`w-4 h-4 ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>

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
                      
                      <CardContent className="p-4 md:p-6 bg-white">
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
                            })()}
                          </span>
                        </div>
                        
                        <div className="flex gap-1.5 md:gap-3">
                          <Button 
                            className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-xl py-2.5 md:py-3 text-xs md:text-sm font-semibold" 
                            onClick={() => {
                              const productId = product.id.toString();
                              addToCart(productId, productId, 1);
                            }}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span className={`hidden md:inline ml-1.5 ${isTamil ? 'tamil-text text-[9px] md:text-[10px]' : 'text-xs md:text-sm'}`}>{translate('products.addToCart')}</span>
                          </Button>
                          
                          <Button 
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-xl py-2.5 md:py-3 text-xs md:text-sm font-semibold" 
                            onClick={() => {
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
                            <CreditCard className="w-4 h-4" />
                            <span className={`hidden md:inline ml-1.5 ${isTamil ? 'tamil-text text-[8px] md:text-[9px]' : 'text-xs md:text-sm'}`}>{translate('product.buyNow')}</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

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
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loadingMore ? 'Loading...' : 'Load More Products'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <FloatingCart />
      <Footer />
    </div>
  );
};

export default AllProducts;