import React from 'react';
import { Sparkles, Flame } from 'lucide-react';

interface ProductSectionSkeletonProps {
  title: string;
  icon: 'sparkles' | 'flame';
  gradient: string;
  count?: number;
}

const ProductSectionSkeleton: React.FC<ProductSectionSkeletonProps> = ({ 
  title, 
  icon, 
  gradient,
  count = 10 
}) => {
  const IconComponent = icon === 'sparkles' ? Sparkles : Flame;
  
  return (
    <section className={`py-16 ${gradient} relative overflow-hidden`}>
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${icon === 'sparkles' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-orange-500 to-red-500'} rounded-full mb-4 shadow-lg animate-pulse`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-64 mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-48 mx-auto animate-pulse"></div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
              {/* Badge Skeleton */}
              <div className="relative">
                <div className="absolute top-2 right-2 z-10 bg-gray-300 rounded-full w-12 h-6"></div>
                <div className="aspect-square bg-gray-300"></div>
              </div>
              
              {/* Content Skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-6 bg-gray-300 rounded w-2/3"></div>
                <div className="flex gap-2">
                  <div className="flex-1 h-8 bg-gray-300 rounded"></div>
                  <div className="flex-1 h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button Skeleton */}
        <div className="text-center mt-12">
          <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-64 mx-auto animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default ProductSectionSkeleton;