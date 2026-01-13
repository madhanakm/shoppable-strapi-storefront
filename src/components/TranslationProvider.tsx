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
  'hero.description': 'Dharani Herbbals commenced research initiatives in Siddha and Ayurveda in 2004, culminating in the company\'s formal incorporation in 2007.',
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
  'products.loadMore': 'Load More Products',
  'products.premiumWellness': 'Premium Wellness',
  'products.collection': 'Collection',
  'products.discoverCurated': 'Discover curated herbal remedies and natural wellness solutions',
  'products.productTypes': 'Product Types',
  'products.allTypes': 'All Types',
  'products.type.deals': 'Deals',
  'products.type.trending': 'Trending',
  'products.type.hot': 'Hot Selling',
  'products.type.popular': 'Popular',
  
  // Checkout Page
  'checkout.title': 'Checkout',
  'checkout.subtitle': 'Complete your order securely',
  'checkout.customerInfo': 'Customer Information',
  'checkout.fullName': 'Full Name',
  'checkout.phone': 'Phone Number',
  'checkout.email': 'Email Address',
  'checkout.shippingAddress': 'Shipping Address',
  'checkout.paymentMethod': 'Payment Method',
  'checkout.orderSummary': 'Order Summary',
  'checkout.subtotal': 'Subtotal',
  'checkout.shipping': 'Shipping',
  'checkout.free': 'Free',
  'checkout.tax': 'Tax',
  'checkout.inclusive': 'Inclusive',
  'checkout.total': 'Total',
  'checkout.placeOrder': 'Place Order',
  'checkout.onlinePayment': 'Online Payment',
  'checkout.onlinePaymentDesc': 'UPI, Cards, Net Banking via Razorpay',
  'checkout.cod': 'Cash on Delivery',
  'checkout.codDesc': 'Pay when you receive your order',
  'checkout.creditPayment': 'Credit Payment',
  'checkout.creditPaymentDesc': 'Pay later - Available for dealers & distributors',
  'checkout.billingAddress': 'Billing Address',
  'checkout.useDifferentBilling': 'Use different billing address',
  'checkout.enterManually': 'Enter address manually',
  'checkout.selectShippingAddress': 'Select Shipping Address',
  'checkout.orderNotes': 'Order Notes (Optional)',
  'checkout.minimumOrderValue': 'Minimum order value',
  'checkout.addMore': 'Add',
  'checkout.toPlaceOrder': 'more to place order',
  'checkout.forFreeShipping': 'more for free shipping',
  
  // Profile Page
  'profile.title': 'My Profile',
  'profile.welcome': 'Welcome back',
  'profile.orders': 'Orders',
  'profile.profile': 'Profile',
  'profile.password': 'Password',
  'profile.addresses': 'Addresses',
  'profile.myOrders': 'My Orders',
  'checkout.secureCheckout': 'Secure & Safe Checkout',
  'checkout.minimumOrderNotMet': 'Minimum Order Not Met',
  
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
  'cart.orderSummary': 'Order Summary',
  'cart.free': 'Free',
  'cart.calculatedAtCheckout': 'Calculated at checkout',
  'cart.inclusive': 'Inclusive',
  'cart.item': 'item',
  'cart.items': 'items',
  'cart.finalShippingNote': '*Final shipping calculated at checkout based on delivery location',
  
  // Wishlist Page
  'wishlist.title': 'Your Wishlist',
  'wishlist.empty': 'Your wishlist is empty',
  'wishlist.continueShopping': 'Continue Shopping',
  'wishlist.addToCart': 'Add to Cart',
  'wishlist.remove': 'Remove',
  'wishlist.item': 'item',
  'wishlist.items': 'items',
  
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
  'product.type.gel': 'Gel',
  
  // Product Detail Page - New Content
  'product.quantity': 'Quantity',
  'product.removeFromWishlist': 'Remove from Wishlist',
  'product.productDetails': 'Product Details',
  'product.brand': 'Brand',
  'product.category': 'Category',
  'product.sku': 'SKU',
  'product.hsn': 'HSN',
  'product.save': 'Save',
  'product.youMightAlsoLike': 'You Might Also Like',
  'product.clickToZoom': 'Click to zoom',
  'product.noImageAvailable': 'No image available',
  'product.noDescriptionAvailable': 'No description available for this product.',
  
  // Sidebar Content
  'sidebar.categories': 'Categories',
  'sidebar.brands': 'Brands',
  'sidebar.quickActions': 'Quick Actions',
  'sidebar.browseAllProducts': 'Browse All Products',
  'sidebar.viewCart': 'View Cart',
  'sidebar.allCategories': 'All Categories',
  'sidebar.allBrands': 'All Brands',
  
  // Search and Filter
  'search.searchResults': 'Search Results for',
  'search.found': 'Found',
  'search.productsMatching': 'products matching your search',
  'search.clearSearch': 'Clear Search',
  'search.searchProducts': 'Search products...',
  'search.noProductsFound': 'No products found',
  'search.tryAdjusting': 'Try adjusting your filters or search criteria',
  'search.clearAllFilters': 'Clear All Filters',
  
  // Product Blocks
  'blocks.dealsOfTheDay': 'Deals of the Day',
  'blocks.dealsDescription': 'Limited time offers with amazing discounts on our best herbal products. Don\'t miss out on these incredible savings!',
  'blocks.trendingProducts': 'Trending Products',
  'blocks.trendingDescription': 'Discover what\'s popular right now - products that are making waves in the herbal wellness market',
  'blocks.hotSelling': 'Hot Selling',
  'blocks.hotDescription': 'Our fastest selling herbal products that customers can\'t get enough of. Join the trend!',
  'blocks.popularChoices': 'Popular Choices',
  'blocks.popularDescription': 'Customer favorites with the highest ratings and most positive reviews. Trusted by thousands!',
  'blocks.viewAll': 'View All',
  
  // General UI
  'ui.showFilters': 'Show Filters',
  'ui.hideFilters': 'Hide Filters',
  'ui.clearAll': 'Clear All',
  'ui.filters': 'Filters',
  'ui.showing': 'Showing',
  'ui.of': 'of',
  'ui.products': 'products',
  'ui.sortByName': 'Sort by Name',
  'ui.priceLowToHigh': 'Price: Low to High',
  'ui.priceHighToLow': 'Price: High to Low',
  'ui.previous': 'Previous',
  'ui.next': 'Next',
  'ui.reviews': 'reviews',
  'ui.description': 'Description',
  
  // About Us Page
  'about.title': 'About Dharani Herbals',
  'about.subtitle': 'Your trusted partner in natural wellness and herbal healthcare solutions',
  'about.ourStory': 'Our Story',
  'about.ourMission': 'Our Mission',
  'about.ourVision': 'Our Vision',
  'about.coreValues': 'Our Core Values',
  'about.whatMakesUsDifferent': 'What Makes Us Different',
  'about.ourCommitment': 'Our Commitment to You',
  'about.joinWellnessJourney': 'Join Our Wellness Journey',
  'about.exploreProducts': 'Explore Our Products',
  'about.getInTouch': 'Get In Touch',
  'about.qualityFirst': 'Quality First',
  'about.naturalSafe': 'Natural & Safe',
  'about.certifiedExcellence': 'Certified Excellence',
  'about.customerFocused': 'Customer Focused',
  'about.yearsExperience': 'Years Experience',
  'about.happyCustomers': 'Happy Customers',
  'about.products': 'Products',
  'about.natural': 'Natural',
  'about.naturalIngredients': '100% Natural Ingredients',
  'about.qualityAssurance': 'Quality Assurance',
  'about.traditionalWisdom': 'Traditional Wisdom',
  'about.authenticProducts': 'Authentic Products',
  'about.customerSatisfaction': 'Customer Satisfaction',
  'about.sustainablePractices': 'Sustainable Practices',
  'about.expertGuidance': 'Expert Guidance',
  'about.continuousInnovation': 'Continuous Innovation',
  'about.transparentCommunication': 'Transparent Communication',
  
  // Contact Us Page
  'contact.title': 'Get In Touch',
  'contact.subtitle': 'Have questions about our herbal products? We\'re here to help you on your wellness journey.',
  'contact.phone': 'Phone',
  'contact.email': 'Email',
  'contact.address': 'Address',
  'contact.businessHours': 'Business Hours',
  'contact.sendMessage': 'Send us a Message',
  'contact.fullName': 'Full Name',
  'contact.phoneNumber': 'Phone Number',
  'contact.emailAddress': 'Email Address',
  'contact.subject': 'Subject',
  'contact.message': 'Message',
  'contact.selectSubject': 'Select a subject',
  'contact.productInquiry': 'Product Inquiry',
  'contact.orderSupport': 'Order Support',
  'contact.wellnessConsultation': 'Wellness Consultation',
  'contact.partnership': 'Partnership Opportunity',
  'contact.feedback': 'Feedback & Suggestions',
  'contact.other': 'Other',
  'contact.messagePlaceholder': 'Tell us how we can help you...',
  'contact.sendingMessage': 'Sending Message...',
  'contact.whyChooseUs': 'Why Choose Us?',
  'contact.support247': '24/7 Support',
  'contact.quickResponse': 'Quick Response',
  'contact.expertGuidance': 'Expert Guidance',
  'contact.followUs': 'Follow Us',
  'contact.visitStore': 'Visit Our Store',
  'contact.messageSent': 'Message Sent Successfully!',
  'contact.messageResponse': 'We\'ll get back to you within 24 hours.',
  'contact.error': 'Error',
  'contact.errorMessage': 'Failed to send message. Please try again.',
  
  // About Us Page Content
  'about.storyPara1': 'Dharani Herbals was founded with a simple yet powerful vision: to bring the ancient wisdom of Ayurveda and herbal medicine to modern wellness seekers. Our journey began with a deep respect for nature\'s healing power and a commitment to providing authentic, high-quality herbal products.',
  'about.storyPara2': 'Located in the heart of Tamil Nadu, we have been serving communities with traditional herbal remedies and wellness products for over a decade. Our expertise lies in combining time-tested Ayurvedic formulations with modern quality standards to create products that truly make a difference in people\'s lives.',
  'about.storyPara3': 'Every product we create is a testament to our dedication to natural wellness, sustainable practices, and the well-being of our customers. We believe that nature has provided us with everything we need to maintain optimal health, and our mission is to make these natural solutions accessible to everyone.',
  'about.missionText': 'To provide authentic, high-quality herbal products that promote natural wellness and healthy living. We are committed to preserving traditional knowledge while embracing modern quality standards to deliver effective, safe, and natural healthcare solutions.',
  'about.visionText': 'To become a leading provider of natural herbal products, making traditional wellness accessible to people worldwide. We envision a healthier world where natural remedies are the first choice for maintaining optimal health and well-being.',
  'about.coreValuesDesc': 'These values guide everything we do and shape our commitment to natural wellness',
  'about.qualityFirstDesc': 'We prioritize quality in every product we create, ensuring the highest standards of herbal wellness.',
  'about.naturalSafeDesc': 'All our products are made from natural ingredients, tested for safety and efficacy.',
  'about.certifiedExcellenceDesc': 'Our products meet international quality standards and certifications.',
  'about.customerFocusedDesc': 'We listen to our customers and continuously improve our products based on feedback.',
  'about.differentDesc': 'Our commitment to excellence sets us apart in the herbal wellness industry',
  'about.naturalIngredientsDesc': 'We source only the finest natural herbs and ingredients, ensuring purity and potency in every product.',
  'about.qualityAssuranceDesc': 'Every product undergoes rigorous testing and quality checks to meet the highest safety standards.',
  'about.traditionalWisdomDesc': 'Our formulations are based on ancient Ayurvedic principles, refined through generations of knowledge.',
  
  // Home Page Content
  'home.shopByCategory': 'Shop by Category',
  'home.categoryDescription': 'Discover our carefully curated collection of natural and organic herbal products, each category designed to support your wellness journey',
  'home.ourValuableCustomerReviews': 'Our Valuable Customer Reviews',
  'home.basedOnReviews': 'Based on {count}+ Google reviews',
  'home.writeReview': 'Write a Review',
  'home.viewAllReviews': 'View All Google Reviews',
  'home.loadingCategories': 'Loading categories...',
  'home.viewProducts': 'View products',
  'home.explore': 'Explore',
  'home.viewAllProducts': 'View All Products',
  
  // Product Blocks Additional Content
  'blocks.megaDeal': 'MEGA DEAL',
  'blocks.limitedTime': 'LIMITED TIME',
  'blocks.viewDeal': 'View Deal',
  'blocks.moreHotDeals': 'More Hot Deals',
  'blocks.viewAllDeals': 'View All Deals',
  'blocks.shopNow': 'Shop Now',
  'blocks.viewAllTrendingProducts': 'View All Trending Products',
  'blocks.viewAllPopularProducts': 'View All Popular Products',
  'blocks.add': 'Add',
  'blocks.buy': 'Buy',
  'blocks.view': 'View',
  'blocks.save': 'Save',
  
  // Footer Content
  'footer.stayUpdated': 'Stay Updated with Natural Wellness',
  'footer.updatesDescription': 'Get the latest updates on herbal products, health tips, and exclusive offers via WhatsApp',
  'footer.whatsappPlaceholder': 'Enter your WhatsApp number',
  'footer.subscribe': 'Subscribe',
  'footer.subscribing': 'Subscribing...',
  'footer.whatsappUpdates': 'I want to receive WhatsApp updates',
  'footer.enterNumber': 'Please enter your WhatsApp number',
  'footer.invalidNumber': 'Please enter a valid 10-digit Indian mobile number',
  'footer.subscribeSuccess': 'Successfully subscribed for WhatsApp updates!',
  'footer.subscribeError': 'Failed to subscribe. Please try again.',
  'footer.alreadySubscribed': 'This number is already subscribed for updates'
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
  'hero.description': 'தரணி ஹெர்பல்ஸ் 2004 இல் சித்த மற்றும் ஆயுர்வேத ஆராய்ச்சி முயற்சிகளைத் தொடங்கியது, 2007 இல் நிறுவனத்தின் முறையான இணைப்பில் உச்சக்கட்டத்தை அடைந்தது.',
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
  'products.loadMore': 'மேலும் தயாரிப்புகள்',
  'products.premiumWellness': 'பிரீமியம் நலவாழ்வு',
  'products.collection': 'தொகுப்பு',
  'products.discoverCurated': 'தேர்ந்தெடுக்கப்பட்ட மூலிகை மருந்துகள் மற்றும் இயற்கை நலவாழ்வு தீர்வுகளை கண்டறியுங்கள்',
  'products.productTypes': 'தயாரிப்பு வகைகள்',
  'products.allTypes': 'அனைத்து வகைகளும்',
  'products.type.deals': 'சலுகைகள்',
  'products.type.trending': 'டிரெண்டிங்',
  'products.type.hot': 'அதிகம் விற்பனை',
  'products.type.popular': 'பிரபலமான',
  
  // Checkout Page
  'checkout.title': 'செக்அவுட்',
  'checkout.subtitle': 'உங்கள் ஆர்டரை பாதுகாப்பாக முடிக்கவும்',
  'checkout.customerInfo': 'வாடிக்கையாளர் தகவல்',
  'checkout.fullName': 'முழு பெயர்',
  'checkout.phone': 'தொலைபேசி எண்',
  'checkout.email': 'மின்னஞ்சல்',
  'checkout.shippingAddress': 'அனுப்புதல் முகவரி',
  'checkout.paymentMethod': 'கட்டண முறை',
  'checkout.orderSummary': 'ஆர்டர் சாராஂசம்',
  'checkout.subtotal': 'கூட்டுத்தொகை',
  'checkout.shipping': 'அனுப்புதல்',
  'checkout.free': 'இலவசம்',
  'checkout.tax': 'வரி',
  'checkout.inclusive': 'உள்ளடங்கிய',
  'checkout.total': 'மொத்தம்',
  'checkout.placeOrder': 'ஆர்டர் செய்ய',
  'checkout.onlinePayment': 'ஆன்லைன் கட்டணம்',
  'checkout.onlinePaymentDesc': 'UPI, கார்டுகள், நெட் பேங்கிங் Razorpay வழியாக',
  'checkout.cod': 'கையில் காசு கொடுப்பது',
  'checkout.codDesc': 'உங்கள் ஆர்டரை பெறும்பொழுது கட்டுங்கள்',
  'checkout.creditPayment': 'கிரெடிட் கட்டணம்',
  'checkout.creditPaymentDesc': 'பின்னர் கட்டுங்கள் - விதரணையாளர்களுக்கு கிடைக்கும்',
  'checkout.billingAddress': 'பில் முகவரி',
  'checkout.useDifferentBilling': 'வேறு பில் முகவரியை பயன்படுத்துங்கள்',
  'checkout.enterManually': 'கையால் முகவரியை உள்ளிடவும்',
  'checkout.selectShippingAddress': 'அனுப்புதல் முகவரியை தேர்ந்தெடுக்கவும்',
  'checkout.orderNotes': 'ஆர்டர் குறிப்புகள் (வேண்டுமெனில்)',
  'checkout.minimumOrderValue': 'குறைந்த ஆர்டர் மதிப்பு',
  'checkout.addMore': 'கூடுதலாக',
  'checkout.toPlaceOrder': 'ஆர்டர் செய்ய',
  'checkout.forFreeShipping': 'இலவச அனுப்புதலுக்கு',
  
  // Profile Page
  'profile.title': 'என் சுயவிவரம்',
  'profile.welcome': 'மறுபடியும் வரவேற்கிறொம்',
  'profile.orders': 'ஆர்டர்கள்',
  'profile.profile': 'சுயவிவரம்',
  'profile.password': 'கடவுச்சொல்',
  'profile.addresses': 'முகவரிகள்',
  'profile.myOrders': 'என் ஆர்டர்கள்',
  'checkout.secureCheckout': 'பாதுகாப்பான செக்அவுட்',
  'checkout.minimumOrderNotMet': 'குறைந்த ஆர்டர் இல்லை',
  
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
  'cart.orderSummary': 'ஆர்டர் சாராஂசம்',
  'cart.free': 'இலவசம்',
  'cart.calculatedAtCheckout': 'செக்அவுட்டில் கணக்கிடும்',
  'cart.inclusive': 'உள்ளடங்கிய',
  'cart.item': 'பொருள்',
  'cart.items': 'பொருட்கள்',
  'cart.finalShippingNote': '*அனுப்புதல் கட்டணம் செக்அவுட்டில் கணக்கிடப்படும்',
  
  // Wishlist Page
  'wishlist.title': 'உங்கள் விருப்பப்பட்டியல்',
  'wishlist.empty': 'உங்கள் விருப்பப்பட்டியல் காலியாக உள்ளது',
  'wishlist.continueShopping': 'ஷாப்பிங் தொடரவும்',
  'wishlist.addToCart': 'கூடையில் சேர்',
  'wishlist.remove': 'அகற்று',
  'wishlist.item': 'பொருள்',
  'wishlist.items': 'பொருட்கள்',
  
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
  'product.type.gel': 'ஜெல்',
  
  // Product Detail Page - New Content
  'product.quantity': 'அளவு',
  'product.removeFromWishlist': 'விருப்பப்பட்டியலில் இருந்து அகற்று',
  'product.productDetails': 'தயாரிப்பு விவரங்கள்',
  'product.brand': 'பிராண்ட்',
  'product.category': 'வகை',
  'product.sku': 'SKU',
  'product.hsn': 'HSN',
  'product.save': 'சேமி',
  'product.youMightAlsoLike': 'நீங்கள் விரும்பக்கூடியவை',
  'product.clickToZoom': 'பெரிதாக்க கிளிக் செய்யவும்',
  'product.noImageAvailable': 'படம் கிடைக்கவில்லை',
  'product.noDescriptionAvailable': 'இந்த தயாரிப்புக்கு விளக்கம் கிடைக்கவில்லை.',
  
  // Sidebar Content
  'sidebar.categories': 'வகைகள்',
  'sidebar.brands': 'பிராண்டுகள்',
  'sidebar.quickActions': 'விரைவு செயல்கள்',
  'sidebar.browseAllProducts': 'அனைத்து தயாரிப்புகளையும் பார்க்கவும்',
  'sidebar.viewCart': 'கூடையைப் பார்க்கவும்',
  'sidebar.allCategories': 'அனைத்து வகைகளும்',
  'sidebar.allBrands': 'அனைத்து பிராண்டுகளும்',
  
  // Search and Filter
  'search.searchResults': 'தேடல் முடிவுகள்',
  'search.found': 'கண்டறியப்பட்டது',
  'search.productsMatching': 'உங்கள் தேடலுக்கு பொருந்தும் தயாரிப்புகள்',
  'search.clearSearch': 'தேடலை அழிக்கவும்',
  'search.searchProducts': 'தயாரிப்புகளைத் தேடுங்கள்...',
  'search.noProductsFound': 'தயாரிப்புகள் எதுவும் கிடைக்கவில்லை',
  'search.tryAdjusting': 'உங்கள் வடிகட்டிகள் அல்லது தேடல் அளவுகோல்களை சரிசெய்ய முயற்சிக்கவும்',
  'search.clearAllFilters': 'அனைத்து வடிகட்டிகளையும் அழிக்கவும்',
  
  // Product Blocks
  'blocks.dealsOfTheDay': 'இன்றைய சலுகைகள்',
  'blocks.dealsDescription': 'எங்கள் சிறந்த மூலிகை தயாரிப்புகளில் அற்புதமான தள்ளுபடிகளுடன் வரையறுக்கப்பட்ட கால சலுகைகள். இந்த நம்பமுடியாத சேமிப்புகளை தவறவிடாதீர்கள்!',
  'blocks.trendingProducts': 'டிரெண்டிங் தயாரிப்புகள்',
  'blocks.trendingDescription': 'இப்போது பிரபலமானவற்றைக் கண்டறியுங்கள் - மூலிகை நலவாழ்வு சந்தையில் அலைகளை உருவாக்கும் தயாரிப்புகள்',
  'blocks.hotSelling': 'அதிகம் விற்பனையாகும்',
  'blocks.hotDescription': 'வாடிக்கையாளர்கள் போதுமானதாக இல்லாத எங்கள் வேகமாக விற்கும் மூலிகை தயாரிப்புகள். டிரெண்டில் சேருங்கள்!',
  'blocks.popularChoices': 'பிரபலமான தேர்வுகள்',
  'blocks.popularDescription': 'அதிக மதிப்பீடுகள் மற்றும் மிகவும் நேர்மறையான விமர்சனங்களுடன் வாடிக்கையாளர் விருப்பங்கள். ஆயிரக்கணக்கானோரால் நம்பப்படுகிறது!',
  'blocks.viewAll': 'அனைத்தையும் பார்க்கவும்',
  
  // General UI
  'ui.showFilters': 'வடிகட்டிகளைக் காட்டு',
  'ui.hideFilters': 'வடிகட்டிகளை மறைக்கவும்',
  'ui.clearAll': 'அனைத்தையும் அழிக்கவும்',
  'ui.filters': 'வடிகட்டிகள்',
  'ui.showing': 'காட்டுகிறது',
  'ui.of': 'இல்',
  'ui.products': 'தயாரிப்புகள்',
  'ui.sortByName': 'பெயர் வரிசையில்',
  'ui.priceLowToHigh': 'விலை: குறைவு முதல் அதிகம்',
  'ui.priceHighToLow': 'விலை: அதிகம் முதல் குறைவு',
  'ui.previous': 'முந்தைய',
  'ui.next': 'அடுத்து',
  'ui.reviews': 'விமர்சனங்கள்',
  'ui.description': 'விளக்கம்',
  
  // About Us Page
  'about.title': 'தரணி ஹெர்பல்ஸ் பற்றி',
  'about.subtitle': 'இயற்கை நலவாழ்வு மற்றும் மூலிகை ஆரோக்கிய தீர்வுகளில் உங்கள் நம்பகமான பங்காளி',
  'about.ourStory': 'எங்கள் கதை',
  'about.ourMission': 'எங்கள் நோக்கம்',
  'about.ourVision': 'எங்கள் நோக்கு',
  'about.coreValues': 'எங்கள் மூல மதிப்புகள்',
  'about.whatMakesUsDifferent': 'என்ன எங்களை வேறுபடுத்துகிறது',
  'about.ourCommitment': 'உங்களுக்கான எங்கள் உறுதி',
  'about.joinWellnessJourney': 'எங்கள் நலவாழ்வு பயணத்தில் சேருங்கள்',
  'about.exploreProducts': 'எங்கள் தயாரிப்புகளை ஆராயுங்கள்',
  'about.getInTouch': 'தொடர்பு கொள்ளுங்கள்',
  'about.qualityFirst': 'தரம் முதலில்',
  'about.naturalSafe': 'இயற்கை & பாதுகாப்பான',
  'about.certifiedExcellence': 'சான்றிதழ் சிறப்பு',
  'about.customerFocused': 'வாடிக்கையாளர் கவனம்',
  'about.yearsExperience': 'ஆண்டுகள் அனுபவம்',
  'about.happyCustomers': 'மகிழ்ச்சியான வாடிக்கையாளர்கள்',
  'about.products': 'தயாரிப்புகள்',
  'about.natural': 'இயற்கை',
  'about.naturalIngredients': '100% இயற்கை பொருட்கள்',
  'about.qualityAssurance': 'தர உறுதி',
  'about.traditionalWisdom': 'பாரம்பரிய ஞானம்',
  'about.authenticProducts': 'அசலான தயாரிப்புகள்',
  'about.customerSatisfaction': 'வாடிக்கையாளர் திருப்தி',
  'about.sustainablePractices': 'நிலைத்தன்மை நடவடிக்கைகள்',
  'about.expertGuidance': 'நிபுணர் வழிகாட்டல்',
  'about.continuousInnovation': 'தொடர்ச்சியான புதுமை',
  'about.transparentCommunication': 'வெளிப்படையான தொடர்பு',
  
  // Contact Us Page
  'contact.title': 'தொடர்பு கொள்ளுங்கள்',
  'contact.subtitle': 'எங்கள் மூலிகை தயாரிப்புகள் பற்றி கேள்விகள் உள்ளதா? உங்கள் நலவாழ்வு பயணத்தில் உதவ இங்கே இருக்கிறோம்.',
  'contact.phone': 'தொலைபேசி',
  'contact.email': 'மின்னஞ்சல்',
  'contact.address': 'முகவரி',
  'contact.businessHours': 'வணிக நேரம்',
  'contact.sendMessage': 'எங்களுக்கு ஒரு செய்தி அனுப்புங்கள்',
  'contact.fullName': 'முழு பெயர்',
  'contact.phoneNumber': 'தொலைபேசி எண்',
  'contact.emailAddress': 'மின்னஞ்சல் முகவரி',
  'contact.subject': 'விஷயம்',
  'contact.message': 'செய்தி',
  'contact.selectSubject': 'விஷயத்தைத் தேர்ந்தெடுக்கவும்',
  'contact.productInquiry': 'தயாரிப்பு விசாரணை',
  'contact.orderSupport': 'ஆர்டர் ஆதரவு',
  'contact.wellnessConsultation': 'நலவாழ்வு ஆலோசனை',
  'contact.partnership': 'பங்காளித்துவ வாய்ப்பு',
  'contact.feedback': 'கருத்து & பரிந்துரைகள்',
  'contact.other': 'மற்றவை',
  'contact.messagePlaceholder': 'நாங்கள் உங்களுக்கு எப்படி உதவ முடியும் என்று சொல்லுங்கள்...',
  'contact.sendingMessage': 'செய்தியை அனுப்புகிறோம்...',
  'contact.whyChooseUs': 'ஏன் எங்களைத் தேர்ந்தெடுக்க வேண்டும்?',
  'contact.support247': '24/7 ஆதரவு',
  'contact.quickResponse': 'விரைவான பதில்',
  'contact.expertGuidance': 'நிபுணர் வழிகாட்டல்',
  'contact.followUs': 'எங்களைப் பின்தொடருங்கள்',
  'contact.visitStore': 'எங்கள் கடையைப் பார்க்கவும்',
  'contact.messageSent': 'செய்தி வெற்றிகரமாக அனுப்பப்பட்டது!',
  'contact.messageResponse': '24 மணி நேரத்தில் நாங்கள் உங்களைத் தொடர்பு கொள்வோம்.',
  'contact.error': 'பிழை',
  'contact.errorMessage': 'செய்தியை அனுப்ப முடியவில்லை. தயவு செய்து மீண்டும் முயற்சிக்கவும்.',
  
  // About Us Page Content
  'about.storyPara1': 'தரணி ஹெர்பல்ஸ் ஒரு எளிய ஆனால் சக்திவாய்ந்த பார்வையுடன் நிறுவப்பட்டது: ஆயுர்வேதம் மற்றும் மூலிகை மருத்துவத்தின் பண்டைய ஞானத்தை நவீன நலவாழ்வு தேடுபவர்களுக்கு கொண்டு வருவது.',
  'about.storyPara2': 'தமிழ்நாட்டின் இதயத்தில் அமைந்துள்ள நாங்கள், ஒரு தசாப்தத்திற்கும் மேலாக பாரம்பரிய மூலிகை மருந்துகள் மற்றும் நலவாழ்வு தயாரிப்புகளுடன் சமூகங்களுக்கு சேவை செய்து வருகிறோம்.',
  'about.storyPara3': 'நாங்கள் உருவாக்கும் ஒவ்வொரு தயாரிப்பும் இயற்கை நலவாழ்வு, நிலையான நடைமுறைகள் மற்றும் எங்கள் வாடிக்கையாளர்களின் நல்வாழ்வுக்கான எங்கள் அர்ப்பணிப்புக்கு சாட்சியாகும்.',
  'about.missionText': 'இயற்கை நலவாழ்வு மற்றும் ஆரோக்கியமான வாழ்க்கையை ஊக்குவிக்கும் உண்மையான, உயர்தர மூலிகை தயாரிப்புகளை வழங்குவது.',
  'about.visionText': 'இயற்கை மூலிகை தயாரிப்புகளின் முன்னணி வழங்குநராக மாறி, பாரம்பரிய நலவாழ்வை உலகம் முழுவதும் உள்ள மக்களுக்கு அணுகக்கூடியதாக மாற்றுவது.',
  'about.coreValuesDesc': 'இந்த மதிப்புகள் நாங்கள் செய்யும் அனைத்தையும் வழிநடத்துகின்றன',
  'about.qualityFirstDesc': 'நாங்கள் உருவாக்கும் ஒவ்வொரு தயாரிப்பிலும் தரத்திற்கு முன்னுரிமை அளிக்கிறோம்.',
  'about.naturalSafeDesc': 'எங்கள் அனைத்து தயாரிப்புகளும் இயற்கை பொருட்களால் தயாரிக்கப்படுகின்றன.',
  'about.certifiedExcellenceDesc': 'எங்கள் தயாரிப்புகள் சர்வதேச தர தரநிலைகளை பூர்த்தி செய்கின்றன.',
  'about.customerFocusedDesc': 'நாங்கள் எங்கள் வாடிக்கையாளர்களின் கருத்துகளைக் கேட்கிறோம்.',
  'about.differentDesc': 'சிறப்புக்கான எங்கள் உறுதிப்பாடு மூலிகை நலவாழ்வு துறையில் எங்களை தனித்துவப்படுத்துகிறது',
  'about.naturalIngredientsDesc': 'நாங்கள் சிறந்த இயற்கை மூலிகைகள் மற்றும் பொருட்களை மட்டுமே பெறுகிறோம்.',
  'about.qualityAssuranceDesc': 'ஒவ்வொரு தயாரிப்பும் கடுமையான சோதனை மற்றும் தர சோதனைகளுக்கு உட்படுத்தப்படுகின்றது.',
  'about.traditionalWisdomDesc': 'எங்கள் சூத்திரங்கள் பண்டைய ஆயுர்வேத கொள்கைகளை அடிப்படையாகக் கொண்டவை.',
  
  // Home Page Content
  'home.shopByCategory': 'வகை வாரியாக வாங்குங்கள்',
  'home.categoryDescription': 'உங்கள் நலவாழ்வு பயணத்தை ஆதரிக்க வடிவமைக்கப்பட்ட ஒவ்வொரு வகையும், இயற்கை மற்றும் ஆர்கானிக் மூலிகை தயாரிப்புகளின் எங்கள் கவனமாக தேர்ந்தெடுக்கப்பட்ட தொகுப்பைக் கண்டறியுங்கள்',
  'home.ourValuableCustomerReviews': 'எங்கள் மதிப்புமிக்க வாடிக்கையாளர் விமர்சனங்கள்',
  'home.basedOnReviews': '{count}+ கூகுள் விமர்சனங்களின் அடிப்படையில்',
  'home.writeReview': 'விமர்சனம் எழுதுங்கள்',
  'home.viewAllReviews': 'கூகுள் விமர்சனங்கள்',
  'home.loadingCategories': 'வகைகளை ஏற்றுகிறது...',
  'home.viewProducts': 'தயாரிப்புகளைப் பார்க்கவும்',
  'home.explore': 'ஆராயுங்கள்',
  'home.viewAllProducts': 'அனைத்து தயாரிப்புகளையும் பார்க்கவும்',
  
  // Product Blocks Additional Content
  'blocks.megaDeal': 'மெகா டீல்',
  'blocks.limitedTime': 'வரையறுக்கப்பட்ட நேரம்',
  'blocks.viewDeal': 'டீலைப் பார்க்கவும்',
  'blocks.moreHotDeals': 'மேலும் சூடான டீல்கள்',
  'blocks.viewAllDeals': 'அனைத்து டீல்களையும் பார்க்கவும்',
  'blocks.shopNow': 'இப்போது வாங்குங்கள்',
  'blocks.viewAllTrendingProducts': 'டிரெண்டிங் தயாரிப்புகள்',
  'blocks.viewAllPopularProducts': 'பிரபலமான தயாரிப்புகள்',
  'blocks.add': 'சேர்',
  'blocks.buy': 'வாங்கு',
  'blocks.view': 'பார்க்கவும்',
  'blocks.save': 'சேமி',
  
  // Footer Content
  'footer.stayUpdated': 'இயற்கை நலவாழ்வுடன் அப்டேட் இருங்கள்',
  'footer.updatesDescription': 'வாட்ஸ்ஆப் வழியாக மூலிகை தயாரிப்புகள், ஆரோக்கிய குறிப்புகள் மற்றும் பிரத்யேக சலுகைகளின் செய்திகளை பெறுங்கள்',
  'footer.whatsappPlaceholder': 'உங்கள் வாட்ஸ்ஆப் எண்ணை உள்ளிடவும்',
  'footer.subscribe': 'சந்தா பெறுங்கள்',
  'footer.subscribing': 'சந்தா பெறுகிறோம்...',
  'footer.whatsappUpdates': 'நான் வாட்ஸ்ஆப் அப்டேட்களை பெற விரும்புகிறேன்',
  'footer.enterNumber': 'தயவு செய்து உங்கள் வாட்ஸ்ஆப் எண்ணை உள்ளிடவும்',
  'footer.invalidNumber': 'தயவு செய்து சரியான 10 இலக்க இந்திய மொபைல் எண்ணை உள்ளிடவும்',
  'footer.subscribeSuccess': 'வாட்ஸ்ஆப் அப்டேட்களுக்காக வெற்றிகரமாக சந்தா பெற்றீர்கள்!',
  'footer.subscribeError': 'சந்தா பெற முடியவில்லை. தயவு செய்து மீண்டும் முயற்சி செய்யவும்.',
  'footer.alreadySubscribed': 'இந்த எண் ஏற்கனவே அப்டேட்களுக்காக சந்தா பெற்றுள்ளது'
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