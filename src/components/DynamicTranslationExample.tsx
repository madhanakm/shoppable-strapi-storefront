import React from 'react';
import { useTranslation } from './TranslationProvider';

// Example of how to use dynamic translations
const DynamicTranslationExample = () => {
  const { translate, translateDynamic } = useTranslation();
  
  // Example dynamic data from API
  const categories = [
    { id: 1, name: 'Hair Oil', tamilName: 'முடி எண்ணெய்' },
    { id: 2, name: 'Skin Care', tamilName: 'தோல் பராமரிப்பு' },
    { id: 3, name: 'Herbal', tamilName: 'மூலிகை' }
  ];
  
  const products = [
    { 
      id: 1, 
      name: 'Herbal Hair Oil', 
      tamilName: 'மூலிகை முடி எண்ணெய்',
      type: 'oil',
      description: 'Natural hair oil for healthy growth',
      tamilDescription: 'ஆரோக்கியமான வளர்ச்சிக்கான இயற்கை முடி எண்ணெய்'
    },
    { 
      id: 2, 
      name: 'Ayurvedic Skin Cream', 
      tamilName: 'ஆயுர்வேத தோல் கிரீம்',
      type: 'cream',
      description: 'Moisturizing cream for all skin types',
      tamilDescription: 'அனைத்து தோல் வகைகளுக்கும் ஈரப்பதமூட்டும் கிரீம்'
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{translate('products.categories')}</h2>
      
      <ul className="mb-6">
        {categories.map(category => (
          <li key={category.id} className="mb-2">
            {/* Method 1: Using predefined translations */}
            {translate(`category.${category.name.replace(/\s+/g, '')}`)}
            
            {/* Method 2: Using dynamic translations with Tamil fallback */}
            {/* {translateDynamic('category', category.name, category.tamilName)} */}
          </li>
        ))}
      </ul>
      
      <h2 className="text-xl font-bold mb-4">{translate('header.products')}</h2>
      
      <div className="space-y-4">
        {products.map(product => (
          <div key={product.id} className="border p-4 rounded">
            <h3 className="font-bold">
              {/* For product names, use the dynamic translation with Tamil fallback */}
              {translateDynamic('product', product.name, product.tamilName)}
            </h3>
            
            <p className="text-sm text-gray-500">
              {/* For product types, use predefined translations */}
              {translate(`product.type.${product.type}`)}
            </p>
            
            <p className="mt-2">
              {/* For descriptions, use dynamic translation with Tamil fallback */}
              {translateDynamic('description', product.description, product.tamilDescription)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicTranslationExample;