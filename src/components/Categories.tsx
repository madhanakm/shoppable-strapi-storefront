import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/use-categories';
import { useApiQuery } from '@/hooks/use-api';

const Categories = () => {
  const [displayCategories, setDisplayCategories] = useState([]);
  
  // Background colors for categories
  const bgColors = [
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-emerald-500 to-emerald-600',
    'bg-gradient-to-br from-teal-500 to-teal-600',
    'bg-gradient-to-br from-lime-500 to-lime-600',
    'bg-gradient-to-br from-cyan-500 to-cyan-600',
    'bg-gradient-to-br from-indigo-500 to-indigo-600',
  ];

  // Fetch categories using our custom hook
  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useCategories();
  
  // Fetch products to get counts and images
  const { 
    data: productsData, 
    isLoading: productsLoading 
  } = useApiQuery('products', '/product-masters');
  
  // Process categories and products when data is available
  useEffect(() => {
    if (categories && productsData) {
      const productArray = productsData.data || [];
      
      // Map the categories to our display format with product counts and images
      const formattedCategories = categories.map((category, index) => {
        const productsInCategory = productArray.filter(
          p => p.attributes?.category === category.name
        );
        
        // Find first product with an image
        const productWithImage = productsInCategory.find(p => p.attributes?.photo);
        
        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          count: `${productsInCategory.length || 0}+ items`,
          color: bgColors[index % bgColors.length],
          image: productWithImage?.attributes?.photo || null
        };
      });
      
      setDisplayCategories(formattedCategories);
    }
  }, [categories, productsData]);

  return (
    <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore our wide range of natural and organic herbal products
          </p>
        </div>

        {categoriesLoading || productsLoading ? (
          <div className="text-center py-12">Loading categories...</div>
        ) : categoriesError ? (
          <div className="text-center py-12 text-red-500">Error loading categories</div>
        ) : (
          <div className="relative">
            <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 z-10">
              <button 
                onClick={() => {
                  const container = document.getElementById('categories-slider');
                  container.scrollBy({ left: -300, behavior: 'smooth' });
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
                {displayCategories.map((category, index) => (
                  <Link 
                    to={`/products?category=${encodeURIComponent(category.name)}`} 
                    key={category.id || index}
                    className="snap-start flex-shrink-0 w-40"
                  >
                    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-primary/10 shadow-md hover:border-primary/30 h-full">
                      <CardContent className="p-4 text-center">
                        <div className={`w-16 h-16 ${category.color} rounded-xl mx-auto mb-4 flex items-center justify-center overflow-hidden`}>
                          {category.image ? (
                            <img 
                              src={category.image} 
                              alt={category.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = `<span class="text-2xl text-white">${category.name.charAt(0).toUpperCase()}</span>`;
                              }}
                            />
                          ) : (
                            <span className="text-2xl text-white">
                              {category.name.charAt(0).toUpperCase()}
                            </span>
                          )}
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
                  container.scrollBy({ left: 300, behavior: 'smooth' });
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