import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { useEffect, lazy, Suspense } from 'react';
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CartProvider } from "@/contexts/CartContext";
import { CompareProvider } from "@/contexts/CompareContext";
import CompareBar from "@/components/CompareBar";
import { AuthProvider } from "@/contexts/AuthContext";
import { QuickCheckoutProvider } from "@/contexts/QuickCheckoutContext";
import { TranslationProvider } from "@/components/TranslationProvider";
import Index from "./pages/Index";
import WhatsAppFloat from "./components/WhatsAppFloat";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";
import FloatingCart from "@/components/FloatingCart";
import SitePopup from "@/components/SitePopup";

// Lazy load non-critical pages
const AllProducts = lazy(() => import('./pages/AllProducts'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const Login = lazy(() => import('./pages/Login'));
const OTPLogin = lazy(() => import('./pages/OTPLogin'));
const Register = lazy(() => import('./pages/Register'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const RefundReturns = lazy(() => import('./pages/RefundReturns'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const AdminPendingOrders = lazy(() => import('./pages/AdminPendingOrders'));
const MobilePayment = lazy(() => import('./pages/MobilePayment'));

// const queryClient = new QueryClient();

const App = ({ onAppMount }: { onAppMount?: () => void }) => {
  useEffect(() => {
    // Call the preloader removal function when app mounts
    onAppMount?.();
  }, [onAppMount]);

  return (
    <HelmetProvider>
      <TranslationProvider>
      <AuthProvider>
        <QuickCheckoutProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <SitePopup />
                  <WhatsAppFloat />
                  <ScrollToTopButton />
                  <BrowserRouter>
                <FloatingCart />
                <CompareBar />
                <ScrollToTop />
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<AllProducts />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsConditions />} />
                  <Route path="/shipping" element={<ShippingPolicy />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/otp-login" element={<OTPLogin />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/refund-returns" element={<RefundReturns />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/admin/pending-orders" element={<AdminPendingOrders />} />
                  <Route path="/mobile-payment" element={<MobilePayment />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
                  </BrowserRouter>
                </TooltipProvider>
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </QuickCheckoutProvider>
      </AuthProvider>
      </TranslationProvider>
    </HelmetProvider>
  );
};

export default App;