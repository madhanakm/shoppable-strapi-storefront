import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, ShoppingCart, Heart, Search, Filter, Loader2 } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { getProducts, searchProducts } from '@/services/products';
import { getCategories } from '@/services/categories';
import { getStrapiMedia } from '@/services/api';
import { Product, StrapiData, Category } from '@/types/strapi';
import { useApiQuery } from '@/hooks/use-api';

const AllProducts = () => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<string[]>(['all']);

  // Fetch products
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts
  } = useApiQuery(
    ['products', page, filterCategory],
    '/products',
    {
      'pagination[page]': page.toString(),
      'pagination[pageSize]': '12',
      'populate': 'image',
      ...(filterCategory !== 'all' ? { 'filters[category]': filterCategory } : {})
    },
    {
      enabled: !searchTerm
    }
  );

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: isLoadingCategories
  } = useApiQuery(['categories'], '/categories', {});

  // Handle search
  useEffect(() => {
    if (searchTerm) {
      const delaySearch = setTimeout(() => {
        searchProducts(searchTerm, page, 12)
          .then(data => {
            // Handle search results
          })
          .catch(error => {
            console.error('Search error:', error);
          });
      }, 500);
      
      return () => clearTimeout(delaySearch);
    }
  }, [searchTerm, page]);

  // Process categories data
  useEffect(() => {
    if (categoriesData?.data) {
      const categoryNames = ['all', ...categoriesData.data.map(cat => cat.attributes.name)];
      setCategories(categoryNames);
    }
  }, [categoriesData]);

  const handleWishlistToggle = (product: StrapiData<Product>) => {
    const productData = {
      id: product.id.toString(),
      name: product.attributes.name,
      price: product.attributes.price,
      image: getStrapiMedia(product.attributes.image?.data?.attributes?.url || ''),
      category: product.attributes.category
    };

    if (isInWishlist(productData.id)) {
      removeFromWishlist(productData.id);
      toast({
        title: "Removed from Wishlist",
        description: `${productData.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(productData);
      toast({
        title: "Added to Wishlist",
        description: `${productData.name} has been added to your wishlist.`,
      });
    }
  };

  const handleAddToCart = (product: StrapiData<Product>) => {
    const productData = {
      id: product.id.toString(),
      name: product.attributes.name,
      price: product.attributes.price,
      image: getStrapiMedia(product.attributes.image?.data?.attributes?.url || ''),
      category: product.attributes.category
    };

    addToCart(productData);
    toast({
      title: "Added to Cart",
      description: `${productData.name} has been added to your cart.`,
    });
  };

  const renderStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };

  // Sort products
  const sortProducts = (products: StrapiData<Product>[]) => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.attributes.price - b.attributes.price;
        case 'price-high':
          return b.attributes.price - a.attributes.price;
        case 'rating':
          return (b.attributes.rating || 0) - (a.attributes.rating || 0);
        default:
          return a.attributes.name.localeCompare(b.attributes.name);
      }
    });
  };

  const products = productsData?.data ? sortProducts(productsData.data) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">All Products</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our complete collection of high-quality products
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {(isLoadingProducts || isLoadingCategories) && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">Loading products...</span>
            </div>
          )}

          {/* Error State */}
          {productsError && (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Failed to load products. Please try again later.</p>
              <Button onClick={() => refetchProducts()} className="mt-4">
                Retry
              </Button>
            </div>
          )}

          {/* Products Grid */}
          {!isLoadingProducts && !productsError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative overflow-hidden">
                    <img 
                      src={getStrapiMedia(product.attributes.image?.data?.attributes?.url || '')}
                      alt={product.attributes.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.attributes.badge && (
                      <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full ${
                        product.attributes.badge === 'Sale' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {product.attributes.badge}
                      </span>
                    )}
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleWishlistToggle(product)}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id.toString()) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {product.attributes.name}
                    </h3>
                    
                    <div className="flex items-center space-x-1 mb-3">
                      {renderStars(product.attributes.rating)}
                      <span className="text-sm text-muted-foreground ml-2">
                        ({product.attributes.reviews || 0})
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-primary">${product.attributes.price}</span>
                        {product.attributes.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through">
                            ${product.attributes.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full group/btn"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoadingProducts && !productsError && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
            </div>
          )}

          {/* Pagination */}
          {productsData?.meta?.pagination && (
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page === productsData.meta.pagination.pageCount}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllProducts;