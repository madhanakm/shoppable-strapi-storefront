import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

const AllProducts = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6; // Show fewer items per page to ensure pagination is visible

  useEffect(() => {
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
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);
  
  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.attributes?.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || product.attributes?.brand === selectedBrand;
    return matchesCategory && matchesBrand;
  });
  
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
                {categories.map(category => (
                  <li key={category}>
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
                ))}
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
                {brands.map(brand => (
                  <li key={brand}>
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
                ))}
              </ul>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProducts.map((product) => (
                <Card key={product.id}>
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={product.attributes?.photo || '/placeholder.svg'} 
                      alt={product.attributes?.Name || 'Product'} 
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg">{product.attributes?.Name || 'Product'}</h3>
                    <p className="text-xl font-bold mt-2">{formatPrice(product.attributes?.mrp)}</p>
                    {product.attributes?.type && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full mt-2 inline-block">
                        {product.attributes.type}
                      </span>
                    )}
                    <Button 
                      className="w-full mt-4"
                      onClick={() => addToCart({
                        id: product.id,
                        name: product.attributes?.Name,
                        price: product.attributes?.mrp
                      })}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <p className="text-center py-12">No products found matching your filters.</p>
            )}
            
            {/* Modern Pagination */}
            <div className="mt-12 flex flex-col items-center">
              <div className="flex items-center space-x-1 rounded-lg bg-gray-100 p-1 shadow-sm">
                <Button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 w-8 p-0 flex items-center justify-center"
                  disabled={page === 1}
                >
                  ←
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Calculate page numbers to show
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        variant={page === pageNum ? "default" : "ghost"}
                        size="sm"
                        className="rounded-full h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button 
                  onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 w-8 p-0 flex items-center justify-center"
                  disabled={page >= totalPages}
                >
                  →
                </Button>
              </div>
              
              <div className="text-sm text-gray-500 mt-2">
                Page {page} of {Math.max(1, totalPages)}
              </div>
            </div>
            
            {/* Products count */}
            <div className="text-center text-sm text-gray-500 mt-4">
              Showing {filteredProducts.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllProducts;