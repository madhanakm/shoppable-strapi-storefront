import React, { createContext, useState, useContext, useEffect } from 'react';

// Define available languages
const LANGUAGES = {
  ENGLISH: 'en',
  TAMIL: 'ta'
};

// Create translation context
const TranslationContext = createContext({
  language: LANGUAGES.ENGLISH,
  setLanguage: (lang: string) => {},
  translate: (key: string) => '',
  translateDynamic: (key: string, enValue: string, taValue?: string) => '',
});

// English translations
const enTranslations = {
  // Header
  'header.home': 'Home',
  'header.products': 'Products',
  'header.about': 'About Us',
  'header.contact': 'Contact Us',
  'header.login': 'Login',
  'header.register': 'Register',
  'header.cart': 'Cart',
  'header.wishlist': 'Wishlist',
  'header.search': 'Search',
  
  // Hero
  'hero.organic': '100% Natural & Organic',
  'hero.welcome': 'Welcome to',
  'hero.companyName': 'Dharani Herbbals',
  'hero.description': 'Dharani Herbbals was formed in the year 2004 to do researches in Siddha & Ayurveda. As a result, Dharani herbbals was founded in 2007.',
  'hero.shopButton': 'Shop Our Products',
  'hero.knowMoreButton': 'Know more',
  'hero.stats.products': 'Herbal Products',
  'hero.stats.customers': 'Happy Customers',
  'hero.stats.experience': 'Years Experience',
  'hero.categories.ayurvedic.title': 'Ayurvedic',
  'hero.categories.ayurvedic.description': 'Traditional remedies',
  'hero.categories.organic.title': 'Organic',
  'hero.categories.organic.description': 'Pure & natural',
  'hero.categories.wellness.title': 'Wellness',
  'hero.categories.wellness.description': 'Health & vitality',
  'hero.categories.supplements.title': 'Supplements',
  'hero.categories.supplements.description': 'Daily nutrition',
  
  // Language Switcher
  'languageSwitcher.english': 'English',
  'languageSwitcher.tamil': 'Tamil',
  
  // Login Page
  'login.title': 'Login to Your Account',
  'login.email': 'Email',
  'login.password': 'Password',
  'login.rememberMe': 'Remember me',
  'login.forgotPassword': 'Forgot password?',
  'login.loginButton': 'Login',
  'login.noAccount': 'Don\'t have an account?',
  'login.signUp': 'Sign up',
  
  // Registration Page
  'register.title': 'Create an Account',
  'register.name': 'Full Name',
  'register.email': 'Email',
  'register.password': 'Password',
  'register.confirmPassword': 'Confirm Password',
  'register.registerButton': 'Register',
  'register.haveAccount': 'Already have an account?',
  'register.login': 'Login',
  
  // Products Page
  'products.title': 'All Products',
  'products.filter': 'Filter',
  'products.sort': 'Sort',
  'products.categories': 'Categories',
  'products.allCategories': 'All Categories',
  'products.brands': 'Brands',
  'products.allBrands': 'All Brands',
  'products.price': 'Price',
  'products.addToCart': 'Add to Cart',
  'products.outOfStock': 'Out of Stock',
  'products.noProducts': 'No products found matching your filters.',
  'products.previous': 'Previous',
  'products.next': 'Next',
  'products.page': 'Page',
  'products.of': 'of',
  
  // Product Detail Page
  'product.addToCart': 'Add to Cart',
  'product.buyNow': 'Buy Now',
  'product.addToWishlist': 'Add to Wishlist',
  'product.description': 'Description',
  'product.benefits': 'Benefits',
  'product.ingredients': 'Ingredients',
  'product.howToUse': 'How to Use',
  'product.reviews': 'Reviews',
  'product.relatedProducts': 'Related Products',
  
  // Cart Page
  'cart.title': 'Your Cart',
  'cart.empty': 'Your cart is empty',
  'cart.continueShopping': 'Continue Shopping',
  'cart.product': 'Product',
  'cart.price': 'Price',
  'cart.quantity': 'Quantity',
  'cart.total': 'Total',
  'cart.remove': 'Remove',
  'cart.subtotal': 'Subtotal',
  'cart.shipping': 'Shipping',
  'cart.tax': 'Tax',
  'cart.orderTotal': 'Order Total',
  'cart.checkout': 'Proceed to Checkout',
  
  // Wishlist Page
  'wishlist.title': 'Your Wishlist',
  'wishlist.empty': 'Your wishlist is empty',
  'wishlist.continueShopping': 'Continue Shopping',
  'wishlist.addToCart': 'Add to Cart',
  'wishlist.remove': 'Remove',
  
  // Common
  'common.loading': 'Loading...',
  'common.error': 'An error occurred',
  'common.noResults': 'No results found',
  
  // Dynamic Content Categories
  'category.HairOil': 'Hair Oil',
  'category.SkinCare': 'Skin Care',
  'category.Herbal': 'Herbal',
  'category.Ayurvedic': 'Ayurvedic',
  'category.Medicine': 'Medicine',
  'category.Health': 'Health',
  'category.Wellness': 'Wellness',
  'category.Beauty': 'Beauty',
  'category.PersonalCare': 'Personal Care',
  'category.Supplements': 'Supplements',
  'category.Oils': 'Oils',
  
  // Dynamic Content Product Types
  'product.type.oil': 'Oil',
  'product.type.cream': 'Cream',
  'product.type.powder': 'Powder',
  'product.type.tablet': 'Tablet',
  'product.type.capsule': 'Capsule',
  'product.type.syrup': 'Syrup',
  'product.type.soap': 'Soap',
  'product.type.shampoo': 'Shampoo',
  'product.type.lotion': 'Lotion',
  'product.type.gel': 'Gel'
};

// Tamil translations
const taTranslations = {
  // Header
  'header.home': 'முகப்பு',
  'header.products': 'தயாரிப்புகள்',
  'header.about': 'எங்களை பற்றி',
  'header.contact': 'தொடர்பு',
  'header.login': 'உள்நுழைய',
  'header.register': 'பதிவு செய்ய',
  'header.cart': 'கூடை',
  'header.wishlist': 'விருப்பப்பட்டியல்',
  'header.search': 'தேடல்',
  
  // Hero
  'hero.organic': '100% இயற்கை & ஆர்கானிக்',
  'hero.welcome': 'வரவேற்கிறோம்',
  'hero.companyName': 'தரணி ஹெர்பல்ஸ்',
  'hero.description': 'தரணி ஹெர்பல்ஸ் 2004 ஆம் ஆண்டில் சித்த மற்றும் ஆயுர்வேத ஆராய்ச்சிகளை செய்ய உருவாக்கப்பட்டது. இதன் விளைவாக, தரணி ஹெர்பல்ஸ் 2007 இல் நிறுவப்பட்டது.',
  'hero.shopButton': 'எங்கள் தயாரிப்புகளை வாங்குங்கள்',
  'hero.knowMoreButton': 'மேலும் அறிய',
  'hero.stats.products': 'மூலிகை தயாரிப்புகள்',
  'hero.stats.customers': 'மகிழ்ச்சியான வாடிக்கையாளர்கள்',
  'hero.stats.experience': 'ஆண்டுகள் அனுபவம்',
  'hero.categories.ayurvedic.title': 'ஆயுர்வேதம்',
  'hero.categories.ayurvedic.description': 'பாரம்பரிய மருந்துகள்',
  'hero.categories.organic.title': 'ஆர்கானிக்',
  'hero.categories.organic.description': 'தூய்மையான & இயற்கை',
  'hero.categories.wellness.title': 'நலவாழ்வு',
  'hero.categories.wellness.description': 'ஆரோக்கியம் & உயிர்சக்தி',
  'hero.categories.supplements.title': 'துணை உணவுகள்',
  'hero.categories.supplements.description': 'தினசரி ஊட்டச்சத்து',
  
  // Language Switcher
  'languageSwitcher.english': 'English',
  'languageSwitcher.tamil': 'தமிழ்',
  
  // Login Page
  'login.title': 'உங்கள் கணக்கில் உள்நுழையவும்',
  'login.email': 'மின்னஞ்சல்',
  'login.password': 'கடவுச்சொல்',
  'login.rememberMe': 'என்னை நினைவில் கொள்ளுங்கள்',
  'login.forgotPassword': 'கடவுச்சொல் மறந்துவிட்டதா?',
  'login.loginButton': 'உள்நுழைய',
  'login.noAccount': 'கணக்கு இல்லையா?',
  'login.signUp': 'பதிவு செய்ய',
  
  // Registration Page
  'register.title': 'கணக்கை உருவாக்கவும்',
  'register.name': 'முழு பெயர்',
  'register.email': 'மின்னஞ்சல்',
  'register.password': 'கடவுச்சொல்',
  'register.confirmPassword': 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
  'register.registerButton': 'பதிவு செய்ய',
  'register.haveAccount': 'ஏற்கனவே கணக்கு உள்ளதா?',
  'register.login': 'உள்நுழைய',
  
  // Products Page
  'products.title': 'அனைத்து தயாரிப்புகளும்',
  'products.filter': 'வடிகட்டி',
  'products.sort': 'வரிசைப்படுத்து',
  'products.categories': 'வகைகள்',
  'products.allCategories': 'அனைத்து வகைகளும்',
  'products.brands': 'பிராண்டுகள்',
  'products.allBrands': 'அனைத்து பிராண்டுகளும்',
  'products.price': 'விலை',
  'products.addToCart': 'கூடையில் சேர்',
  'products.outOfStock': 'கையிருப்பில் இல்லை',
  'products.noProducts': 'உங்கள் வடிகட்டிகளுக்கு பொருந்தும் தயாரிப்புகள் எதுவும் கிடைக்கவில்லை.',
  'products.previous': 'முந்தைய',
  'products.next': 'அடுத்து',
  'products.page': 'பக்கம்',
  'products.of': 'இல்',
  
  // Product Detail Page
  'product.addToCart': 'கூடையில் சேர்',
  'product.buyNow': 'இப்போது வாங்கு',
  'product.addToWishlist': 'விருப்பப்பட்டியலில் சேர்',
  'product.description': 'விளக்கம்',
  'product.benefits': 'நன்மைகள்',
  'product.ingredients': 'பொருட்கள்',
  'product.howToUse': 'பயன்படுத்தும் முறை',
  'product.reviews': 'விமர்சனங்கள்',
  'product.relatedProducts': 'தொடர்புடைய தயாரிப்புகள்',
  
  // Cart Page
  'cart.title': 'உங்கள் கூடை',
  'cart.empty': 'உங்கள் கூடை காலியாக உள்ளது',
  'cart.continueShopping': 'ஷாப்பிங் தொடரவும்',
  'cart.product': 'தயாரிப்பு',
  'cart.price': 'விலை',
  'cart.quantity': 'அளவு',
  'cart.total': 'மொத்தம்',
  'cart.remove': 'அகற்று',
  'cart.subtotal': 'கூட்டுத்தொகை',
  'cart.shipping': 'அனுப்புதல்',
  'cart.tax': 'வரி',
  'cart.orderTotal': 'ஆர்டர் மொத்தம்',
  'cart.checkout': 'செக்அவுட் செய்ய',
  
  // Wishlist Page
  'wishlist.title': 'உங்கள் விருப்பப்பட்டியல்',
  'wishlist.empty': 'உங்கள் விருப்பப்பட்டியல் காலியாக உள்ளது',
  'wishlist.continueShopping': 'ஷாப்பிங் தொடரவும்',
  'wishlist.addToCart': 'கூடையில் சேர்',
  'wishlist.remove': 'அகற்று',
  
  // Common
  'common.loading': 'ஏற்றுகிறது...',
  'common.error': 'பிழை ஏற்பட்டது',
  'common.noResults': 'முடிவுகள் எதுவும் கிடைக்கவில்லை',
  
  // Dynamic Content Categories
  'category.HairOil': 'முடி எண்ணெய்',
  'category.SkinCare': 'தோல் பராமரிப்பு',
  'category.Herbal': 'மூலிகை',
  'category.Ayurvedic': 'ஆயுர்வேதம்',
  'category.Medicine': 'மருந்து',
  'category.Health': 'ஆரோக்கியம்',
  'category.Wellness': 'நலவாழ்வு',
  'category.Beauty': 'அழகு',
  'category.PersonalCare': 'தனிப்பட்ட பராமரிப்பு',
  'category.Supplements': 'துணை உணவுகள்',
  'category.Oils': 'எண்ணெய்கள்',
  
  // Dynamic Content Product Types
  'product.type.oil': 'எண்ணெய்',
  'product.type.cream': 'கிரீம்',
  'product.type.powder': 'பவுடர்',
  'product.type.tablet': 'மாத்திரை',
  'product.type.capsule': 'கேப்சூல்',
  'product.type.syrup': 'சிரப்',
  'product.type.soap': 'சோப்பு',
  'product.type.shampoo': 'ஷாம்பு',
  'product.type.lotion': 'லோஷன்',
  'product.type.gel': 'ஜெல்'
};

// Translation provider component
export const TranslationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState(LANGUAGES.ENGLISH);
  
  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === LANGUAGES.ENGLISH || savedLanguage === LANGUAGES.TAMIL)) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
    
    // Apply Tamil font to the entire body when Tamil is selected
    if (language === LANGUAGES.TAMIL) {
      document.body.classList.add('tamil-text');
    } else {
      document.body.classList.remove('tamil-text');
    }
  }, [language]);
  
  // Translation function for static content
  const translate = (key: string) => {
    const translations = language === LANGUAGES.ENGLISH ? enTranslations : taTranslations;
    const translatedText = translations[key] || key;
    
    // Add tamil-text class for Tamil text
    if (language === LANGUAGES.TAMIL) {
      return translatedText;
    }
    
    return translatedText;
  };
  
  // Translation function for dynamic content
  const translateDynamic = (key: string, enValue: string, taValue?: string) => {
    // If we're in English mode or no Tamil translation is provided
    if (language === LANGUAGES.ENGLISH || !taValue) {
      // First try to find a predefined translation for this key
      const predefinedKey = `${key}.${enValue.replace(/\s+/g, '')}`;
      const predefinedTranslation = translate(predefinedKey);
      
      // If we found a predefined translation that's not just the key itself
      if (predefinedTranslation !== predefinedKey) {
        return predefinedTranslation;
      }
      
      // Otherwise return the English value
      return enValue;
    }
    
    // If we're in Tamil mode and have a Tamil translation
    return taValue;
  };
  
  return (
    <TranslationContext.Provider value={{ language, setLanguage, translate, translateDynamic }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use translations
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export { LANGUAGES };