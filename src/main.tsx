
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FancySitePreloader from './components/FancySitePreloader';

const API = 'https://api.dharaniherbbals.com/api';
const TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;
const HEADERS = { 'Authorization': `Bearer ${TOKEN}` };

// Configure React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'stale',
      retry: 1,
    },
  },
});

// Pre-fetch critical home page data into React Query cache during preloader
const prefetchHomeData = async () => {
  await Promise.allSettled([
    // Product categories for header
    queryClient.prefetchQuery({
      queryKey: ['menuCategories'],
      queryFn: async () => {
        const r = await fetch(`${API}/product-categories?filters[type][$eq]=Best Selling&filters[status][$eq]=true&pagination[pageSize]=1&fields[0]=Name&fields[1]=menuItem`, { headers: HEADERS });
        if (!r.ok) return [];
        const data = await r.json();
        return data.data || [];
      },
      staleTime: 1000 * 60 * 60,
    }),
    // Ecommerce settings
    queryClient.prefetchQuery({
      queryKey: ['ecommerceSettings'],
      queryFn: async () => {
        const r = await fetch(`${API}/ecommerce-settings/`);
        return r.ok ? r.json() : null;
      },
      staleTime: 1000 * 60 * 60,
    }),
    // State shipping rates
    queryClient.prefetchQuery({
      queryKey: ['stateShippingRates'],
      queryFn: async () => {
        const r = await fetch(`${API}/state-shipping-rates?pagination[pageSize]=100`, { headers: HEADERS });
        return r.ok ? r.json() : null;
      },
      staleTime: 1000 * 60 * 60,
    }),
  ]);
};

// Start prefetch immediately
prefetchHomeData();

// Remove preloader when React mounts
const removePreloader = () => {
  const preloader = document.getElementById('site-preloader');
  if (!preloader) return;

  const shownAt = (window as any).__preloaderShownAt || Date.now();
  const elapsed = Date.now() - shownAt;
  const minDuration = 6000;
  const delay = Math.max(0, minDuration - elapsed);

  setTimeout(async () => {
    // Wait for fonts before revealing page — eliminates FOUT
    try { await (document as any).fonts?.ready; } catch {}
    document.body.classList.remove('preloader-active');
    preloader.style.opacity = '0';
    preloader.style.pointerEvents = 'none';
    setTimeout(() => preloader?.remove(), 600);
  }, delay);
};

const root = createRoot(document.getElementById("root")!);
root.render(
	<QueryClientProvider client={queryClient}>
		<FancySitePreloader />
		<App onAppMount={removePreloader} />
	</QueryClientProvider>
);