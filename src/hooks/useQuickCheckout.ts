import { useContext, createContext } from 'react';

export interface QuickCheckoutItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  skuid?: string;
  quantity: number;
  tamil?: string;
  variation?: string;
}

export interface QuickCheckoutContextType {
  quickCheckoutItem: QuickCheckoutItem | null;
  setQuickCheckoutItem: (item: QuickCheckoutItem | null) => void;
  clearQuickCheckout: () => void;
}

export const QuickCheckoutContext = createContext<QuickCheckoutContextType | undefined>(undefined);

export const useQuickCheckout = () => {
  const context = useContext(QuickCheckoutContext);
  if (!context) {
    throw new Error('useQuickCheckout must be used within a QuickCheckoutProvider');
  }
  return context;
};
