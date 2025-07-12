import React, { createContext, useContext, useState, ReactNode } from 'react';

interface QuickCheckoutItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  skuid?: string;
  quantity: number;
}

interface QuickCheckoutContextType {
  quickCheckoutItem: QuickCheckoutItem | null;
  setQuickCheckoutItem: (item: QuickCheckoutItem | null) => void;
  clearQuickCheckout: () => void;
}

const QuickCheckoutContext = createContext<QuickCheckoutContextType | undefined>(undefined);

export const useQuickCheckout = () => {
  const context = useContext(QuickCheckoutContext);
  if (!context) {
    throw new Error('useQuickCheckout must be used within a QuickCheckoutProvider');
  }
  return context;
};

export const QuickCheckoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quickCheckoutItem, setQuickCheckoutItem] = useState<QuickCheckoutItem | null>(null);

  const clearQuickCheckout = () => {
    setQuickCheckoutItem(null);
  };

  return (
    <QuickCheckoutContext.Provider value={{
      quickCheckoutItem,
      setQuickCheckoutItem,
      clearQuickCheckout
    }}>
      {children}
    </QuickCheckoutContext.Provider>
  );
};