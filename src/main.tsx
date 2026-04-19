
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
const PRODUCT_FIELDS = 'fields[0]=Name&fields[1]=skuid&fields[2]=mrp&fields[3]=resellerprice&fields[4]=customerprice&fields[5]=retailprice&fields[6]=sarvoprice&fields[7]=distributorprice&fields[8]=price&fields[9]=type&fields[10]=status&fields[11]=tamil&fields[12]=isVariableProduct&fields[13]=variations&fields[14]=category&fields[15]=newLaunch&fields[16]=stock';

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
    // Best selling products
    queryClient.prefetchQuery({
      queryKey: ['bestSellingProducts', 'customer', 10],
      queryFn: async () => {
        const r = await fetch(`${API}/product-masters?filters[type][$eq]=Best Selling&filters[status][$eq]=true&pagination[pageSize]=10&${PRODUCT_FIELDS}`, { headers: HEADERS });
        if (!r.ok) return { products: [], reviewStats: {} };
        const data = await r.json();
        const products = (data.data || []).slice(0, 10).map((p: any) => ({
          id: p.id,
          name: p.attributes?.Name || p.attributes?.name,
          image: '',
          displayPrice: p.attributes?.customerprice || 0,
          category: p.attributes?.category,
          skuId: p.attributes?.skuid || p.id.toString(),
          isVariableProduct: p.attributes?.isVariableProduct,
          ...p.attributes
        }));
        return { products, reviewStats: {} };
      },
      staleTime: 1000 * 60 * 30,
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
  const minDuration = 2500;
  const delay = Math.max(0, minDuration - elapsed);

  setTimeout(() => {
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