import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

// Individual Product Card Skeleton
export const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border border-gray-100 bg-white rounded-3xl">
      <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Skeleton className="w-full h-56" />
        {/* Badge skeleton */}
        <Skeleton className="absolute top-4 right-4 w-16 h-6 rounded-2xl" />
      </div>
      
      <CardContent className="p-6 bg-white">
        {/* Product name skeleton */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-3" />
        
        {/* Rating skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 w-8 ml-2" />
          </div>
        </div>
        
        {/* Price skeleton */}
        <div className="mb-4">
          <Skeleton className="h-6 w-20 mb-1" />
        </div>
        
        {/* Buttons skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full rounded-xl" />
          <Skeleton className="h-8 w-full rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
};

// Product Grid Skeleton
export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Product Detail Skeleton
export const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:w-80 flex-shrink-0 order-last lg:order-first">
            <div className="sticky top-24 space-y-4">
              {/* Categories Card Skeleton */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <Skeleton className="h-16 w-full" />
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full rounded-xl" />
                  ))}
                </div>
              </div>
              
              {/* Brands Card Skeleton */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <Skeleton className="h-16 w-full" />
                <div className="p-4 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Image Skeleton */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="relative bg-gradient-to-br from-gray-50 to-white p-8">
                <Skeleton className="w-full h-[500px] rounded-2xl" />
              </div>
              
              {/* Gallery Skeleton */}
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-16 h-16 rounded-lg" />
                  ))}
                </div>
              </div>
              
              {/* Description Skeleton */}
              <div className="p-6 border-t border-gray-100">
                <Skeleton className="h-6 w-32 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
          
          {/* Product Info Skeleton */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10">
              {/* Title and Rating */}
              <div className="mb-6">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-3/4 mb-4" />
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-5 rounded-full" />
                  ))}
                  <Skeleton className="h-4 w-16 ml-2" />
                </div>
              </div>
              
              {/* Price */}
              <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-green-50 rounded-2xl">
                <Skeleton className="h-12 w-32 mb-2" />
                <Skeleton className="h-6 w-20" />
              </div>
              
              {/* Quantity */}
              <div className="mb-8">
                <Skeleton className="h-4 w-16 mb-3" />
                <Skeleton className="h-12 w-32 rounded-2xl" />
              </div>
              
              {/* Buttons */}
              <div className="mb-8">
                <div className="flex gap-4 mb-4">
                  <Skeleton className="flex-1 h-12 rounded-xl" />
                  <Skeleton className="flex-1 h-12 rounded-xl" />
                </div>
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
              
              {/* Product Details */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-3 bg-white rounded-xl">
                      <Skeleton className="h-3 w-12 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Block Skeleton
export const ProductBlockSkeleton = () => {
  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="flex flex-col items-center mb-8">
            <Skeleton className="w-20 h-20 rounded-3xl mb-6" />
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex justify-center items-center gap-2 mb-4">
            <Skeleton className="w-8 h-1 rounded-full" />
            <Skeleton className="w-16 h-2 rounded-full" />
            <Skeleton className="w-8 h-1 rounded-full" />
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <ProductGridSkeleton count={8} />

        {/* View All Button Skeleton */}
        <div className="text-center mt-16">
          <Skeleton className="h-12 w-40 rounded-2xl mx-auto" />
        </div>
      </div>
    </section>
  );
};

// Enhanced Loading States with Status Messages
export const LoadingWithStatus = ({ 
  message = "Loading products...", 
  showProgress = false, 
  progress = 0,
  stage = "Fetching",
  showSteps = false,
  currentStep = 1,
  totalSteps = 3,
  loadedCount = 0,
  totalCount = 0,
  showETA = false,
  estimatedTime = 0
}) => {
  const steps = [
    { id: 1, name: "Connecting", description: "Establishing connection" },
    { id: 2, name: "Fetching", description: "Loading product data" },
    { id: 3, name: "Processing", description: "Preparing products" }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      {/* Enhanced Animated Loading Icon */}
      <div className="relative">
        <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-r-green-500 rounded-full animate-spin" 
             style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        <div className="absolute inset-2 w-20 h-20 border-2 border-transparent border-b-blue-400 rounded-full animate-spin" 
             style={{ animationDuration: '2s' }}></div>
        
        {/* Center status indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-full p-2 shadow-lg">
            {currentStep === 1 && <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>}
            {currentStep === 2 && <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>}
            {currentStep === 3 && <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>}
          </div>
        </div>
      </div>
      
      {/* Status Message */}
      <div className="text-center max-w-md">
        <p className="text-2xl font-bold text-gray-800 mb-2">{message}</p>
        <p className="text-lg text-primary font-semibold mb-3">{stage}...</p>
        
        {/* Product Count Display */}
        {totalCount > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{loadedCount}</p>
                <p className="text-xs text-gray-600">Loaded</p>
              </div>
              <div className="text-gray-400">/</div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700">{totalCount}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
            {totalCount > 0 && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-green-500 h-2 rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${(loadedCount / totalCount) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {Math.round((loadedCount / totalCount) * 100)}% Complete
                </p>
              </div>
            )}
          </div>
        )}
        
        {showProgress && (
          <div className="w-80 bg-gray-200 rounded-full h-4 mx-auto mb-4 shadow-inner">
            <div 
              className="bg-gradient-to-r from-primary via-blue-500 to-green-500 h-4 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        )}
        
        {showSteps && (
          <div className="flex justify-center space-x-6 mb-6">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-lg ${
                  currentStep > step.id ? 'bg-green-500 text-white scale-110' :
                  currentStep === step.id ? 'bg-primary text-white animate-pulse scale-110' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <p className={`text-sm mt-2 transition-colors font-medium ${
                  currentStep >= step.id ? 'text-primary' : 'text-gray-400'
                }`}>
                  {step.name}
                </p>
                <p className={`text-xs mt-1 transition-colors ${
                  currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        )}
        
        {/* ETA Display */}
        {showETA && estimatedTime > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700">
              ⏱️ Estimated time remaining: <span className="font-semibold">{estimatedTime}s</span>
            </p>
          </div>
        )}
        
        <p className="text-sm text-gray-500">Please wait while we fetch the latest products</p>
      </div>
      
      {/* Enhanced Animated Dots */}
      <div className="flex space-x-3">
        <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      
      {/* Loading Tips */}
      <div className="text-center max-w-sm">
        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
          💡 <span className="font-medium">Tip:</span> Products are loaded fresh to show you the latest prices and availability
        </p>
      </div>
    </div>
  );
};

// Quick Loading Indicator for smaller spaces
export const QuickLoader = ({ size = "md", message = "Loading..." }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };
  
  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <div className={`${sizeClasses[size]} border-2 border-primary/20 border-t-primary rounded-full animate-spin`}></div>
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
};

// Product Loading with Count and Real-time Status
export const ProductCountLoader = ({ 
  expectedCount = 0, 
  loadedCount = 0, 
  currentProduct = "",
  loadingSpeed = 0,
  showDetails = true 
}) => {
  const percentage = expectedCount > 0 ? (loadedCount / expectedCount) * 100 : 0;
  const remainingCount = expectedCount - loadedCount;
  const estimatedTime = loadingSpeed > 0 ? Math.ceil(remainingCount / loadingSpeed) : 0;
  
  return (
    <div className="text-center py-8 max-w-md mx-auto">
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-20 h-20 border-2 border-transparent border-r-green-400 rounded-full animate-spin" 
             style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <span className="text-sm font-bold text-primary">{loadedCount}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-xl font-bold text-gray-800 mb-1">
            Loading Products...
          </p>
          <p className="text-lg text-primary font-semibold">
            {loadedCount} / {expectedCount}
          </p>
        </div>
        
        {expectedCount > 0 && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-primary via-blue-500 to-green-500 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                style={{ width: `${percentage}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{Math.round(percentage)}% Complete</span>
              {estimatedTime > 0 && <span>~{estimatedTime}s remaining</span>}
            </div>
          </div>
        )}
        
        {showDetails && currentProduct && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Currently loading:</span>
            </p>
            <p className="text-sm text-blue-800 font-medium truncate">
              {currentProduct}
            </p>
          </div>
        )}
        
        {loadingSpeed > 0 && (
          <div className="text-xs text-gray-500">
            Loading at {loadingSpeed.toFixed(1)} products/second
          </div>
        )}
      </div>
    </div>
  );
};

// Shimmer effect for better loading experience
export const ShimmerCard = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="relative">
          <div className="w-full h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
          <div className="absolute top-3 right-3 w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="absolute top-3 left-3 w-16 h-6 bg-gray-300 rounded-2xl"></div>
        </div>
        <div className="p-6">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full mb-2"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4 mb-3"></div>
          <div className="flex items-center mb-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded-full mr-1"></div>
            ))}
          </div>
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20 mb-3"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Product Grid with Shimmer
export const EnhancedProductGridSkeleton = ({ count = 8, showStatus = true }) => {
  return (
    <div className="space-y-8">
      {showStatus && (
        <div className="text-center">
          <QuickLoader size="lg" message="Loading product catalog..." />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <ShimmerCard key={index} />
        ))}
      </div>
    </div>
  );
};

// Real-time Loading Status Component
export const RealTimeLoadingStatus = ({ 
  stage = "Initializing",
  message = "Loading...",
  progress = 0,
  loadedItems = 0,
  totalItems = 0,
  currentItem = "",
  errors = [],
  warnings = [],
  showLogs = false,
  logs = [],
  estimatedTimeRemaining = 0
}) => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="relative inline-block mb-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{message}</h3>
        <p className="text-primary font-semibold">{stage}</p>
      </div>

      {/* Progress Section */}
      <div className="space-y-4 mb-6">
        {/* Main Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-primary via-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Items Counter */}
        {totalItems > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Items Processed</span>
              <span className="text-lg font-bold text-primary">{loadedItems} / {totalItems}</span>
            </div>
            <div className="w-full bg-white rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalItems > 0 ? (loadedItems / totalItems) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Current Item */}
        {currentItem && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-700 mb-1">
              <span className="font-medium">Currently processing:</span>
            </p>
            <p className="text-sm text-blue-800 font-medium truncate">{currentItem}</p>
          </div>
        )}

        {/* Time Remaining */}
        {estimatedTimeRemaining > 0 && (
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <span>⏱️</span>
            <span>Estimated time remaining: <strong>{estimatedTimeRemaining}s</strong></span>
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{loadedItems}</div>
          <div className="text-xs text-green-700">Loaded</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{warnings.length}</div>
          <div className="text-xs text-yellow-700">Warnings</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{errors.length}</div>
          <div className="text-xs text-red-700">Errors</div>
        </div>
      </div>

      {/* Errors and Warnings */}
      {errors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Errors ({errors.length})
          </h4>
          <div className="bg-red-50 rounded-lg p-3 max-h-24 overflow-y-auto">
            {errors.slice(-3).map((error, index) => (
              <p key={index} className="text-xs text-red-700 mb-1">{error}</p>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Warnings ({warnings.length})
          </h4>
          <div className="bg-yellow-50 rounded-lg p-3 max-h-24 overflow-y-auto">
            {warnings.slice(-3).map((warning, index) => (
              <p key={index} className="text-xs text-yellow-700 mb-1">{warning}</p>
            ))}
          </div>
        </div>
      )}

      {/* Activity Logs */}
      {showLogs && logs.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Activity Log
          </h4>
          <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto font-mono text-xs">
            {logs.slice(-10).map((log, index) => (
              <p key={index} className="text-gray-600 mb-1">
                <span className="text-gray-400">[{new Date().toLocaleTimeString()}]</span> {log}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Compact Loading Status for smaller spaces
export const CompactLoadingStatus = ({ 
  message = "Loading...",
  progress = 0,
  showProgress = true,
  size = "md"
}) => {
  const sizeClasses = {
    sm: { spinner: "w-4 h-4", text: "text-sm" },
    md: { spinner: "w-6 h-6", text: "text-base" },
    lg: { spinner: "w-8 h-8", text: "text-lg" }
  };
  
  const classes = sizeClasses[size];
  
  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className={`${classes.spinner} border-2 border-primary/20 border-t-primary rounded-full animate-spin flex-shrink-0`}></div>
      <div className="flex-1 min-w-0">
        <p className={`${classes.text} font-medium text-gray-800 truncate`}>{message}</p>
        {showProgress && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-primary to-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% complete</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Loading Status with Network Information
export const NetworkAwareLoadingStatus = ({ 
  message = "Loading...",
  progress = 0,
  networkSpeed = "unknown",
  dataTransferred = 0,
  totalDataSize = 0,
  connectionType = "unknown"
}) => {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-6">
        <div className="relative inline-block mb-4">
          <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{message}</h3>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-primary to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">{Math.round(progress)}% complete</p>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-gray-600">Connection:</span>
          <span className="font-medium text-gray-800">{connectionType}</span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-gray-600">Speed:</span>
          <span className="font-medium text-gray-800">{networkSpeed}</span>
        </div>
        
        {totalDataSize > 0 && (
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="text-gray-600">Data:</span>
            <span className="font-medium text-gray-800">
              {formatBytes(dataTransferred)} / {formatBytes(totalDataSize)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};