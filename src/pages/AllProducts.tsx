import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router-dom';

const AllProducts = () => {
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8; // 2 rows x 4 columns

  // Get category from URL if present
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Track loading state for all requests
    let productsLoaded = false;
    let categoriesLoaded = false;
    let brandsLoaded = false;
    
    // Update loading state
    const updateLoading = () => {
      if (productsLoaded && categoriesLoaded && brandsLoaded) {
        setLoading(false);
      }
    };
    
    // Fetch products
    fetch('https://api.dharaniherbbals.com/api/product-masters')
      .then(response => response.json())
      .then(data => {
        let productArray = [];
        if (data && data.data && Array.isArray(data.data)) {
          productArray = data.data;
        } else if (Array.isArray(data)) {
          productArray = data;
        }
        
        setProducts(productArray);
        productsLoaded = true;
        updateLoading();
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        productsLoaded = true;
        updateLoading();
      });
    
    // Fetch categories from dedicated endpoint
    fetch('https://api.dharaniherbbals.com/api/product-categories')
      .then(response => response.json())
      .then(data => {
        console.log('Categories API response:', data);
        
        let categoryNames = [];
        
        // Try different ways to extract category names based on API structure
        if (Array.isArray(data)) {
          // Direct array of categories
          categoryNames = data.map(cat => cat.name || cat.Name || cat.title || cat).filter(Boolean);
        } else if (data && data.data && Array.isArray(data.data)) {
          // Strapi format with data wrapper
          categoryNames = data.data.map(cat => {
            if (cat.attributes) {
              return cat.attributes.name || cat.attributes.Name || cat.attributes.title;
            }
            return cat.name || cat.Name || cat.title;
          }).filter(Boolean);
        }
        
        console.log('Extracted category names:', categoryNames);
        
        // If still empty, fallback to hardcoded categories for testing
        if (categoryNames.length === 0) {
          categoryNames = ['Hair Care', 'Skin Care', 'Herbal', 'Ayurvedic', 'Medicine'];
          console.log('Using fallback categories');
        }
        
        setCategories(categoryNames);
        categoriesLoaded = true;
        updateLoading();
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        // Fallback to hardcoded categories
        const fallbackCategories = ['Hair Care', 'Skin Care', 'Herbal', 'Ayurvedic', 'Medicine'];
        setCategories(fallbackCategories);
        categoriesLoaded = true;
        updateLoading();
      });
      
    // Fetch brands from dedicated endpoint
    fetch('https://api.dharaniherbbals.com/api/brands')
      .then(response => response.json())
      .then(data => {
        console.log('Brands API response:', data);
        
        let brandNames = [];
        
        // Try different ways to extract brand names based on API structure
        if (Array.isArray(data)) {
          // Direct array of brands
          brandNames = data.map(brand => brand.name || brand.Name || brand.title || brand).filter(Boolean);
        } else if (data && data.data && Array.isArray(data.data)) {
          // Strapi format with data wrapper
          brandNames = data.data.map(brand => {
            if (brand.attributes) {
              return brand.attributes.name || brand.attributes.Name || brand.attributes.title;
            }
            return brand.name || brand.Name || brand.title;
          }).filter(Boolean);
        }
        
        console.log('Extracted brand names:', brandNames);
        
        // If still empty, fallback to hardcoded brands for testing
        if (brandNames.length === 0) {
          brandNames = ['Dharani', 'Ayush', 'Patanjali', 'Himalaya', 'Dabur'];
          console.log('Using fallback brands');
        }
        
        setBrands(brandNames);
        brandsLoaded = true;
        updateLoading();
      })
      .catch(error => {
        console.error('Error fetching brands:', error);
        // Fallback to hardcoded brands
        const fallbackBrands = ['Dharani', 'Ayush', 'Patanjali', 'Himalaya', 'Dabur'];
        setBrands(fallbackBrands);
        brandsLoaded = true;
        updateLoading();
      });
  }, []);
  
  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.attributes?.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || product.attributes?.brand === selectedBrand;
    return matchesCategory && matchesBrand;
  });
  
  // Debug filtering
  console.log('Selected category:', selectedCategory);
  console.log('Selected brand:', selectedBrand);
  console.log('Filtered products count:', filteredProducts.length);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading products...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-center mb-8">All Products</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <h2 className="font-bold text-lg mb-4">Categories</h2>
              <ul className="space-y-2">
                <li>
                  <button 
                    className={`w-full text-left px-2 py-1 rounded ${selectedCategory === 'all' ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => {
                      setSelectedCategory('all');
                      setPage(1);
                    }}
                  >
                    All Categories
                  </button>
                </li>
                {categories.length > 0 ? (
                  categories.map((category, index) => (
                    <li key={index}>
                      <button 
                        className={`w-full text-left px-2 py-1 rounded ${selectedCategory === category ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
                        onClick={() => {
                          setSelectedCategory(category);
                          setPage(1);
                        }}
                      >
                        {category}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500 px-2 py-1">No categories found</li>
                )}
              </ul>
              
              <h2 className="font-bold text-lg mt-6 mb-4">Brands</h2>
              <ul className="space-y-2">
                <li>
                  <button 
                    className={`w-full text-left px-2 py-1 rounded ${selectedBrand === 'all' ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => {
                      setSelectedBrand('all');
                      setPage(1);
                    }}
                  >
                    All Brands
                  </button>
                </li>
                {brands.length > 0 ? (
                  brands.map((brand, index) => (
                    <li key={index}>
                      <button 
                        className={`w-full text-left px-2 py-1 rounded ${selectedBrand === brand ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
                        onClick={() => {
                          setSelectedBrand(brand);
                          setPage(1);
                        }}
                      >
                        {brand}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500 px-2 py-1">No brands found</li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {displayedProducts.map((product) => (
                <Card key={product.id} className="bg-gray-50 border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-square overflow-hidden bg-white flex items-center justify-center">
                      <img 
                        src={product.attributes?.photo || '/placeholder.svg'} 
                        alt={product.attributes?.Name || 'Product'} 
                        className="max-w-full max-h-64 object-contain hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-base">{product.attributes?.Name || 'Product'}</h3>
                      <p className="text-xl font-bold mt-2 text-primary">{formatPrice(product.attributes?.mrp)}</p>
                    </CardContent>
                  </Link>
                  <div className="px-5 pb-5">
                    <Button 
                      className="w-full"
                      onClick={() => addToCart({
                        id: product.id,
                        name: product.attributes?.Name,
                        price: product.attributes?.mrp,
                        image: product.attributes?.photo
                      })}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <p className="text-center py-12">No products found matching your filters.</p>
              )}
            </div>
            
            {/* Pagination */}
            {filteredProducts.length > itemsPerPage && (
              <div className="mt-8 flex justify-center">
                <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                  
                  <span className="mx-2 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllProducts;