import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const AllProducts = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');

  useEffect(() => {
    fetch('https://api.dharaniherbbals.com/api/product-masters')
      .then(response => response.json())
      .then(data => {
        console.log('API response:', data);
        
        // Extract products from Strapi format
        let productArray = [];
        if (data && data.data && Array.isArray(data.data)) {
          productArray = data.data;
        } else if (Array.isArray(data)) {
          productArray = data;
        }
        
        setProducts(productArray);
        
        // Extract unique categories and brands
        // Clean up categories by trimming whitespace and removing duplicates
        const uniqueCategories = [...new Set(
          productArray
            .map(p => p.attributes?.category?.trim())
            .filter(Boolean)
            .filter(cat => cat !== "undefined" && cat !== "null")
        )];
        
        // Clean up brands by trimming whitespace and removing duplicates
        const uniqueBrands = [...new Set(
          productArray
            .map(p => p.attributes?.brand?.trim())
            .filter(Boolean)
            .filter(brand => brand !== "undefined" && brand !== "null")
        )];
        
        console.log('Unique categories:', uniqueCategories);
        console.log('Unique brands:', uniqueBrands);
        
        setCategories(uniqueCategories);
        setBrands(uniqueBrands);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  // Format price in Indian Rupees
  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString('en-IN')}`;
  };
  
  // Filter products based on selected category and brand
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.attributes?.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || product.attributes?.brand === selectedBrand;
    return matchesCategory && matchesBrand;
  });

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
                    onClick={() => setSelectedCategory('all')}
                  >
                    All Categories
                  </button>
                </li>
                {categories.length > 0 ? (
                  categories.map(category => (
                    <li key={category}>
                      <button 
                        className={`w-full text-left px-2 py-1 rounded ${selectedCategory === category ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-sm px-2">No categories found</li>
                )}
              </ul>
              
              <h2 className="font-bold text-lg mt-6 mb-4">Brands</h2>
              <ul className="space-y-2">
                <li>
                  <button 
                    className={`w-full text-left px-2 py-1 rounded ${selectedBrand === 'all' ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => setSelectedBrand('all')}
                  >
                    All Brands
                  </button>
                </li>
                {brands.length > 0 ? (
                  brands.map(brand => (
                    <li key={brand}>
                      <button 
                        className={`w-full text-left px-2 py-1 rounded ${selectedBrand === brand ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
                        onClick={() => setSelectedBrand(brand)}
                      >
                        {brand}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-sm px-2">No brands found</li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id}>
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={product.attributes?.photo || '/placeholder.svg'} 
                      alt={product.attributes?.Name || 'Product'} 
                      className="w-full h-full object-cover"
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllProducts;