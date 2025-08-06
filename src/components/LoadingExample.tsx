import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  RealTimeLoadingStatus, 
  CompactLoadingStatus, 
  NetworkAwareLoadingStatus,
  ProductCountLoader 
} from './ProductSkeleton';
import { useLoadingProgress, LOADING_CONFIGS, detectNetworkSpeed } from '@/hooks/use-loading-progress';

const LoadingExample = () => {
  const [activeDemo, setActiveDemo] = useState('realtime');
  const [isLoading, setIsLoading] = useState(false);
  const loadingProgress = useLoadingProgress(LOADING_CONFIGS.PRODUCTS, false);
  const [networkInfo, setNetworkInfo] = useState({ effectiveType: 'unknown', downlink: 0, rtt: 0 });

  useEffect(() => {
    const network = detectNetworkSpeed();
    setNetworkInfo(network);
  }, []);

  const simulateLoading = async () => {
    setIsLoading(true);
    loadingProgress.startLoading();
    
    // Simulate loading process
    const products = [
      'Herbal Hair Oil',
      'Ayurvedic Skin Cream', 
      'Natural Face Wash',
      'Organic Shampoo',
      'Herbal Supplements'
    ];
    
    loadingProgress.setTotalItems(products.length);
    
    for (let i = 0; i < products.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadingProgress.setCurrentItem(products[i]);
      loadingProgress.incrementLoaded();
      loadingProgress.setManualStep(2, ((i + 1) / products.length) * 100);
      
      // Simulate some warnings and errors
      if (i === 2) {
        loadingProgress.addWarning('Product image quality is low');
      }
      if (i === 4) {
        loadingProgress.addError('Failed to load price for this product');
      }
    }
    
    loadingProgress.stopLoading();
    setIsLoading(false);
  };

  const renderDemo = () => {
    switch (activeDemo) {
      case 'realtime':
        return (
          <RealTimeLoadingStatus 
            message="Loading Product Catalog"
            stage={loadingProgress.stage}
            progress={loadingProgress.progress}
            loadedItems={loadingProgress.stats.loadedItems}
            totalItems={loadingProgress.stats.totalItems}
            currentItem={loadingProgress.stats.currentItem}
            errors={loadingProgress.stats.errors}
            warnings={loadingProgress.stats.warnings}
            logs={loadingProgress.stats.logs}
            estimatedTimeRemaining={loadingProgress.stats.estimatedTimeRemaining}
            showLogs={true}
          />
        );
      
      case 'compact':
        return (
          <CompactLoadingStatus 
            message="Loading products..."
            progress={loadingProgress.progress}
            showProgress={true}
            size="lg"
          />
        );
      
      case 'network':
        return (
          <NetworkAwareLoadingStatus 
            message="Loading products..."
            progress={loadingProgress.progress}
            networkSpeed={`${networkInfo.downlink} Mbps`}
            connectionType={networkInfo.effectiveType}
            dataTransferred={loadingProgress.stats.loadedItems * 1024}
            totalDataSize={loadingProgress.stats.totalItems * 1024}
          />
        );
      
      case 'counter':
        return (
          <ProductCountLoader 
            expectedCount={loadingProgress.stats.totalItems}
            loadedCount={loadingProgress.stats.loadedItems}
            currentProduct={loadingProgress.stats.currentItem}
            loadingSpeed={loadingProgress.stats.loadingSpeed}
            showDetails={true}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Enhanced Loading Preview Demo
        </h1>
        <p className="text-gray-600 mb-6">
          Experience different loading states with real-time status updates
        </p>
      </div>

      {/* Demo Controls */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button 
          variant={activeDemo === 'realtime' ? 'default' : 'outline'}
          onClick={() => setActiveDemo('realtime')}
        >
          Real-time Status
        </Button>
        <Button 
          variant={activeDemo === 'compact' ? 'default' : 'outline'}
          onClick={() => setActiveDemo('compact')}
        >
          Compact Loading
        </Button>
        <Button 
          variant={activeDemo === 'network' ? 'default' : 'outline'}
          onClick={() => setActiveDemo('network')}
        >
          Network Aware
        </Button>
        <Button 
          variant={activeDemo === 'counter' ? 'default' : 'outline'}
          onClick={() => setActiveDemo('counter')}
        >
          Product Counter
        </Button>
      </div>

      {/* Start Loading Button */}
      <div className="text-center mb-8">
        <Button 
          onClick={simulateLoading}
          disabled={isLoading}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? 'Loading...' : 'Start Demo Loading'}
        </Button>
      </div>

      {/* Demo Display */}
      <div className="min-h-[400px] flex items-center justify-center">
        {isLoading || loadingProgress.stats.totalItems > 0 ? (
          renderDemo()
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">Click "Start Demo Loading" to see the loading preview</p>
            <p className="text-sm">Choose different loading styles from the buttons above</p>
          </div>
        )}
      </div>

      {/* Features List */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Enhanced Loading Features</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Real-time Status</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Live progress tracking</li>
              <li>• Current item being processed</li>
              <li>• Error and warning logs</li>
              <li>• Estimated time remaining</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Smart Features</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Network speed detection</li>
              <li>• Loading speed calculation</li>
              <li>• Activity logging</li>
              <li>• Responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingExample;