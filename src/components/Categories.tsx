
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Categories = () => {
  const categories = [
    { name: 'Electronics', count: '2,543 items', color: 'bg-blue-500' },
    { name: 'Fashion', count: '1,829 items', color: 'bg-pink-500' },
    { name: 'Home & Garden', count: '957 items', color: 'bg-green-500' },
    { name: 'Sports & Outdoor', count: '734 items', color: 'bg-orange-500' },
    { name: 'Books & Media', count: '1,234 items', color: 'bg-purple-500' },
    { name: 'Health & Beauty', count: '892 items', color: 'bg-teal-500' },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our wide range of categories to find exactly what you're looking for
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${category.color} rounded-full mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}></div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
