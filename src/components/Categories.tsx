import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { getStrapiMedia } from '@/services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Background colors for categories
  const bgColors = [
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-emerald-500 to-emerald-600',
    'bg-gradient-to-br from-teal-500 to-teal-600',
    'bg-gradient-to-br from-lime-500 to-lime-600',
    'bg-gradient-to-br from-cyan-500 to-cyan-600',
    'bg-gradient-to-br from-indigo-500 to-indigo-600',
  ];

  useEffect(() => {
    // First try with product-categories endpoint
    fetch('https://api.dharaniherbbals.com/api/product-categories')
      .then(response => response.json())
      .then(data => {
        console.log('Categories API response:', data);
        
        if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          processCategories(data);
        } else {
          // Fallback to categories endpoint
          return fetch('https://api.dharaniherbbals.com/api/categories');
        }
      })
      .then(response => {
        if (response) return response.json();
        return null;
      })
      .then(data => {
        if (data) {
          console.log('Fallback categories API response:', data);
          processCategories(data);
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        // Use hardcoded categories as last resort
        const fallbackCategories = [
          { id: 1, name: 'Hair Care', slug: 'hair-care', count: '10+ items', color: bgColors[0] },
          { id: 2, name: 'Skin Care', slug: 'skin-care', count: '15+ items', color: bgColors[1] },
          { id: 3, name: 'Herbal', slug: 'herbal', count: '20+ items', color: bgColors[2] },
          { id: 4, name: 'Ayurvedic', slug: 'ayurvedic', count: '12+ items', color: bgColors[3] },
          { id: 5, name: 'Medicine', slug: 'medicine', count: '18+ items', color: bgColors[4] },
        ];
        setCategories(fallbackCategories);
        setLoading(false);
      });
  }, []);

  // Process categories data from API
  const processCategories = (data) => {
    if (data && data.data && Array.isArray(data.data)) {
      // Map the data with image and count information
      const formattedCategories = data.data.map((item, index) => {
        // Get category name - try different possible field names
        const name = item.attributes?.name || 
                    item.attributes?.Name || 
                    item.attributes?.title || 
                    `Category ${index + 1}`;
        
        return {
          id: item.id,
          name: name,
          slug: item.attributes?.slug || name.toLowerCase().replace(/\s+/g, '-'),
          count: '0+ items',
          color: bgColors[index % bgColors.length]
        };
      });
      
      setCategories(formattedCategories);
    }
    setLoading(false);
  };

  // Fetch product counts after categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      fetch('https://api.dharaniherbbals.com/api/product-masters')
        .then(response => response.json())
        .then(data => {
          let productArray = [];
          if (data && data.data && Array.isArray(data.data)) {
            productArray = data.data;
          }
          
          // Update categories with product counts
          const updatedCategories = categories.map(category => {
            const productsInCategory = productArray.filter(
              p => p.attributes?.category === category.name
            );
            
            return {
              ...category,
              count: `${productsInCategory.length || 0}+ items`
            };
          });
          
          setCategories(updatedCategories);
        })
        .catch(error => {
          console.error('Error fetching products:', error);
        });
    }
  }, [categories.length]);

  return (
    <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore our wide range of natural and organic herbal products
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">No categories found</div>
        ) : (
          <div className="relative">
            <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 z-10">
              <button 
                onClick={() => {
                  const container = document.getElementById('categories-slider');
                  if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                }}
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              >
                ←
              </button>
            </div>
            
            <div 
              id="categories-slider"
              className="flex overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-4 px-2">
                {categories.map((category) => (
                  <Link 
                    to={`/products?category=${encodeURIComponent(category.name)}`} 
                    key={category.id}
                    className="snap-start flex-shrink-0 w-40"
                  >
                    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-primary/10 shadow-md hover:border-primary/30 h-full">
                      <CardContent className="p-4 text-center">
                        <div className={`w-16 h-16 ${category.color} rounded-xl mx-auto mb-4 flex items-center justify-center overflow-hidden`}>
                          <span className="text-2xl text-white">
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm mb-1">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">{category.count}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
              <button 
                onClick={() => {
                  const container = document.getElementById('categories-slider');
                  if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                }}
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;