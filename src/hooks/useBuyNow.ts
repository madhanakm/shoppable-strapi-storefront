import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuickCheckout } from '@/hooks/useQuickCheckout';
import { QuickCheckoutItem } from '@/hooks/useQuickCheckout';

export const useBuyNow = () => {
  const { isAuthenticated, loading } = useAuth();
  const { setQuickCheckoutItem } = useQuickCheckout();
  const navigate = useNavigate();

  const buyNow = (item: QuickCheckoutItem) => {
    setQuickCheckoutItem(item); // persisted to sessionStorage
    if (!loading && !isAuthenticated) {
      navigate('/otp-login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  return { buyNow };
};
