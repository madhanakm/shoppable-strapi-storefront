import React, { createContext, useContext, useState } from 'react';

interface CompareProduct {
  id: number;
  name: string;
  price: number;
  priceRange?: string;
  image: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  skuid?: string;
  brand?: string;
  weight?: string;
}

interface CompareContextType {
  compareList: CompareProduct[];
  addToCompare: (product: CompareProduct) => Promise<void>;
  removeFromCompare: (id: number) => void;
  isInCompare: (id: number) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
};

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<CompareProduct[]>([]);

  const addToCompare = async (product: CompareProduct) => {
    if (compareList.length >= 3) return;
    if (compareList.find(p => p.id === product.id)) return;
    
    const TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;
    const HEADERS = { 'Authorization': `Bearer ${TOKEN}` };

    // Fetch extra details if missing
    if (!product.rating && !product.brand && !product.weight) {
      try {
        const [productRes, reviewRes] = await Promise.all([
          fetch(`https://api.dharaniherbbals.com/api/product-masters/${product.id}?fields[0]=brand&fields[1]=description&fields[2]=Name`, { headers: HEADERS }),
          fetch(`https://api.dharaniherbbals.com/api/product-reviews?filters[productId][$eq]=${product.id}&filters[isActive][$eq]=true&fields[0]=rating`, { headers: HEADERS })
        ]);
        if (productRes.ok) {
          const d = await productRes.json();
          const a = d.data?.attributes || {};
          product.brand = a.brand || undefined;
          product.description = product.description || a.description || undefined;
        }
        if (reviewRes.ok) {
          const rd = await reviewRes.json();
          const reviews = rd.data || [];
          if (reviews.length > 0) {
            const ratings = reviews.map((r: any) => parseFloat(r.attributes?.rating || r.rating || 0)).filter((r: number) => r > 0);
            product.rating = ratings.length > 0 ? parseFloat((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)) : 0;
            product.reviewCount = ratings.length;
          }
        }
      } catch (e) {
        console.error('Compare fetch error:', e);
      }
    }
    
    setCompareList(prev => [...prev, product]);
  };

  const removeFromCompare = (id: number) => {
    setCompareList(prev => prev.filter(p => p.id !== id));
  };

  const isInCompare = (id: number) => compareList.some(p => p.id === id);

  const clearCompare = () => setCompareList([]);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};
