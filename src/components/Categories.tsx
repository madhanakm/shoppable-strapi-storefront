
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Categories = () => {
  const categories = [
    { name: 'Ayurvedic Medicines', count: '150+ items', color: 'bg-gradient-to-br from-green-500 to-green-600' },
    { name: 'Herbal Supplements', count: '120+ items', color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
    { name: 'Natural Oils', count: '80+ items', color: 'bg-gradient-to-br from-teal-500 to-teal-600' },
    { name: 'Herbal Teas', count: '45+ items', color: 'bg-gradient-to-br from-lime-500 to-lime-600' },
    { name: 'Skin Care', count: '95+ items', color: 'bg-gradient-to-br from-cyan-500 to-cyan-600' },
    { name: 'Hair Care', count: '60+ items', color: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
  ];

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4 lg:mb-6">Shop by Category</h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Explore our wide range of natural and organic herbal products for your wellness journey
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6 xl:gap-8">
          {categories.map((category, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 border-primary/10 shadow-md hover:border-primary/30">
              <CardContent className="p-3 md:p-4 lg:p-6 text-center">
                <div className={`w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 ${category.color} rounded-xl md:rounded-2xl mx-auto mb-2 md:mb-3 lg:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}></div>
                <h3 className="font-semibold text-xs md:text-sm lg:text-base mb-1 md:mb-2 group-hover:text-primary transition-colors leading-tight">{category.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{category.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
