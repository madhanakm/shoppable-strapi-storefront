import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { getProductCategories } from '@/services/categories';

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
    // Fetch product categories with images
    getProductCategories()
      .then(categoryData => {
        // Process category data
        
        let formattedCategories = [];
        
        if (Array.isArray(categoryData)) {
          // Direct array format
          formattedCategories = categoryData.map((item, index) => ({
            id: index,
            name: item.Name,
            count: '0+ items',
            color: bgColors[index % bgColors.length],
            photo: item.photo
          }));
        } else if (categoryData && Array.isArray(categoryData.data)) {
          // Strapi format
          formattedCategories = categoryData.data.map((item, index) => ({
            id: item.id || index,
            name: item.Name || item.name || item.attributes?.Name || item.attributes?.name,
            count: '0+ items',
            color: bgColors[index % bgColors.length],
            photo: item.photo || item.attributes?.photo
          }));
        }
        
        // Now fetch products to get accurate counts with timestamp to prevent caching
        const timestamp = new Date().getTime();
        fetch(`https://api.dharaniherbbals.com/api/product-masters?pagination[limit]=-1&timestamp=${timestamp}`)
          .then(response => response.json())
          .then(productData => {
            let productArray = [];
            if (productData && productData.data && Array.isArray(productData.data)) {
              productArray = productData.data;
            } else if (Array.isArray(productData)) {
              productArray = productData;
            }
            
            // Update categories with accurate product counts
            const categoriesWithCounts = formattedCategories.map(category => {
              const productsInCategory = productArray.filter(p => {
                const attrs = p.attributes || p;
                return attrs.category === category.name && (attrs.status === true || attrs.status === 'true');
              });
              
              const count = productsInCategory.length;
              
              return {
                ...category,
                count: count === 1 ? '1 item' : `${count} items`
              };
            });
            
            setCategories(categoriesWithCounts);
            setLoading(false);
          })
          .catch(error => {
            // Handle product fetch error
            setCategories(formattedCategories);
            setLoading(false);
          });
      })
      .catch(error => {
        // Handle category fetch error
        setLoading(false);
      });
  }, []);

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
                          {category.photo ? (
                            <img 
                              src={category.photo}
                              alt={category.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Handle image load error
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