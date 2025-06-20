import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Background colors for categories
  const bgColors = [
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-emerald-500 to-emerald-600',
    'bg-gradient-to-br from-teal-500 to-teal-600',
    'bg-gradient-to-br from-lime-500 to-lime-600',
    'bg-gradient-to-br from-cyan-500 to-cyan-600',
    'bg-gradient-to-br from-indigo-500 to-indigo-600',
  ];

  // Hardcoded categories as fallback
  const dummyCategories = [
    { id: 1, name: 'Hair Oil', count: '25+ items', color: bgColors[0] },
    { id: 2, name: 'Skin Care', count: '18+ items', color: bgColors[1] },
    { id: 3, name: 'Herbal', count: '32+ items', color: bgColors[2] },
    { id: 4, name: 'Ayurvedic', count: '15+ items', color: bgColors[3] },
    { id: 5, name: 'Medicine', count: '20+ items', color: bgColors[4] },
    { id: 6, name: 'Health', count: '28+ items', color: bgColors[5] },
  ];

  // Fetch categories from API
  useEffect(() => {
    // Start with dummy data to ensure something shows
    setCategories(dummyCategories);
    
    // Try product-masters endpoint to get categories with images
    fetch('https://api.dharaniherbbals.com/api/product-masters')
      .then(response => {
        console.log('API Response Status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Products API data:', data);
        
        let productArray = [];
        if (data && data.data && Array.isArray(data.data)) {
          productArray = data.data;
        } else if (Array.isArray(data)) {
          productArray = data;
        }
        
        // Extract unique categories
        const uniqueCategories = [...new Set(
          productArray
            .map(p => p.attributes?.category)
            .filter(Boolean)
        )];
        
        console.log('Unique categories:', uniqueCategories);
        
        if (uniqueCategories.length > 0) {
          // Create categories with images from products
          const categoriesWithImages = uniqueCategories.map((categoryName, index) => {
            const productsInCategory = productArray.filter(p => p.attributes?.category === categoryName);
            const count = productsInCategory.length;
            
            // Find first product with an image
            const productWithImage = productsInCategory.find(p => p.attributes?.photo);
            const image = productWithImage?.attributes?.photo || null;
            
            console.log(`Category ${categoryName} image:`, image ? 'has image' : 'no image');
            
            return {
              id: `cat-${index}`,
              name: categoryName,
              count: `${count}+ items`,
              image: image,
              color: bgColors[index % bgColors.length]
            };
          });
          
          console.log('Categories with images:', categoriesWithImages);
          setCategories(categoriesWithImages);
        } else {
          console.log('No categories found in products, using dummy data');
          // Keep using dummy data if no categories found
        }
        
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        setError(error.message);
        // Keep using dummy data on error
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
          {error && <p className="text-red-500 mt-2">Error: {error}</p>}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading categories...</div>
        ) : (
          <div className="relative">
            <div className="flex overflow-x-auto pb-6" style={{ scrollbarWidth: 'none' }}>
              <div className="flex gap-4 px-2">
                {categories.map((category, index) => (
                  <Link 
                    to={`/products?category=${encodeURIComponent(category.name)}`} 
                    key={index} // Use index as key for reliability
                    className="flex-shrink-0 w-40"
                  >
                    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                      <CardContent className="p-4 text-center">
                        <div className={`w-16 h-16 ${category.color} rounded-xl mx-auto mb-4 flex items-center justify-center overflow-hidden`}>
                          {category.image ? (
                            <img 
                              src={category.image} 
                              alt={category.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log(`Image failed to load for ${category.name}`);
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
                        <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">{category.count}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;