import { useState, useEffect, useCallback } from 'react';

export interface LoadingStep {
  id: number;
  name: string;
  description: string;
  duration?: number;
}

export interface LoadingStats {
  loadedItems: number;
  totalItems: number;
  currentItem: string;
  errors: string[];
  warnings: string[];
  logs: string[];
  startTime: number;
  estimatedTimeRemaining: number;
  loadingSpeed: number;
}

export const useLoadingProgress = (steps: LoadingStep[] = [], autoProgress = true) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<LoadingStats>({
    loadedItems: 0,
    totalItems: 0,
    currentItem: '',
    errors: [],
    warnings: [],
    logs: [],
    startTime: 0,
    estimatedTimeRemaining: 0,
    loadingSpeed: 0
  });

  const defaultSteps: LoadingStep[] = [
    { id: 1, name: "Connecting", description: "Establishing connection", duration: 800 },
    { id: 2, name: "Fetching", description: "Loading data", duration: 1500 },
    { id: 3, name: "Processing", description: "Preparing content", duration: 1000 }
  ];

  const loadingSteps = steps.length > 0 ? steps : defaultSteps;

  useEffect(() => {
    if (!autoProgress || !isLoading) return;

    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    const runStep = (stepIndex: number) => {
      if (stepIndex >= loadingSteps.length) {
        setProgress(100);
        return;
      }

      const step = loadingSteps[stepIndex];
      setCurrentStep(step.id);
      setStage(step.description);

      const stepDuration = step.duration || 1000;
      const progressIncrement = 100 / loadingSteps.length;
      const startProgress = stepIndex * progressIncrement;
      const endProgress = (stepIndex + 1) * progressIncrement;

      let currentProgress = startProgress;
      const incrementAmount = (endProgress - startProgress) / (stepDuration / 50);

      intervalId = setInterval(() => {
        currentProgress += incrementAmount;
        if (currentProgress >= endProgress) {
          currentProgress = endProgress;
          clearInterval(intervalId);
          
          timeoutId = setTimeout(() => {
            runStep(stepIndex + 1);
          }, 200);
        }
        setProgress(Math.min(currentProgress, 100));
      }, 50);
    };

    runStep(0);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading, autoProgress]);

  const startLoading = () => {
    enhancedStartLoading();
  };

  const stopLoading = () => {
    enhancedStopLoading();
  };

  const setManualStep = (stepId: number, progressValue?: number) => {
    setCurrentStep(stepId);
    if (progressValue !== undefined) {
      setProgress(progressValue);
    }
    const step = loadingSteps.find(s => s.id === stepId);
    if (step) {
      setStage(step.description);
    }
  };

  const updateStats = useCallback((updates: Partial<LoadingStats>) => {
    setStats(prev => {
      const newStats = { ...prev, ...updates };
      
      // Calculate loading speed and ETA
      if (newStats.loadedItems > 0 && newStats.startTime > 0) {
        const elapsed = (Date.now() - newStats.startTime) / 1000;
        newStats.loadingSpeed = newStats.loadedItems / elapsed;
        
        if (newStats.totalItems > newStats.loadedItems && newStats.loadingSpeed > 0) {
          const remaining = newStats.totalItems - newStats.loadedItems;
          newStats.estimatedTimeRemaining = Math.ceil(remaining / newStats.loadingSpeed);
        }
      }
      
      return newStats;
    });
  }, []);

  const addLog = useCallback((message: string) => {
    updateStats({
      logs: [...stats.logs, `${new Date().toLocaleTimeString()}: ${message}`].slice(-20)
    });
  }, [stats.logs, updateStats]);

  const addError = useCallback((error: string) => {
    updateStats({
      errors: [...stats.errors, error]
    });
    addLog(`ERROR: ${error}`);
  }, [stats.errors, updateStats, addLog]);

  const addWarning = useCallback((warning: string) => {
    updateStats({
      warnings: [...stats.warnings, warning]
    });
    addLog(`WARNING: ${warning}`);
  }, [stats.warnings, updateStats, addLog]);

  const setCurrentItem = useCallback((item: string) => {
    updateStats({ currentItem: item });
    addLog(`Processing: ${item}`);
  }, [updateStats, addLog]);

  const incrementLoaded = useCallback((count: number = 1) => {
    updateStats({ loadedItems: stats.loadedItems + count });
  }, [stats.loadedItems, updateStats]);

  const setTotalItems = useCallback((total: number) => {
    updateStats({ totalItems: total });
    addLog(`Total items to process: ${total}`);
  }, [updateStats, addLog]);

  const resetStats = useCallback(() => {
    setStats({
      loadedItems: 0,
      totalItems: 0,
      currentItem: '',
      errors: [],
      warnings: [],
      logs: [],
      startTime: Date.now(),
      estimatedTimeRemaining: 0,
      loadingSpeed: 0
    });
  }, []);

  const enhancedStartLoading = useCallback(() => {
    setIsLoading(true);
    setCurrentStep(1);
    setProgress(0);
    setStage(loadingSteps[0]?.description || 'Loading...');
    resetStats();
    updateStats({ startTime: Date.now() });
    addLog('Loading started');
  }, [loadingSteps, resetStats, updateStats, addLog]);

  const enhancedStopLoading = useCallback(() => {
    setIsLoading(false);
    setProgress(100);
    setCurrentStep(loadingSteps.length);
    addLog('Loading completed');
  }, [loadingSteps.length, addLog]);

  return {
    currentStep,
    progress,
    stage,
    isLoading,
    totalSteps: loadingSteps.length,
    stats,
    startLoading: enhancedStartLoading,
    stopLoading: enhancedStopLoading,
    setManualStep,
    steps: loadingSteps,
    // Enhanced methods
    updateStats,
    addLog,
    addError,
    addWarning,
    setCurrentItem,
    incrementLoaded,
    setTotalItems,
    resetStats
  };
};

// Predefined loading configurations for different scenarios
export const LOADING_CONFIGS = {
  PRODUCTS: [
    { id: 1, name: "Connecting", description: "Connecting to server", duration: 500 },
    { id: 2, name: "Fetching", description: "Loading products", duration: 1200 },
    { id: 3, name: "Processing", description: "Preparing display", duration: 800 }
  ],
  FEATURED: [
    { id: 1, name: "Analyzing", description: "Finding featured items", duration: 600 },
    { id: 2, name: "Loading", description: "Fetching featured products", duration: 1000 },
    { id: 3, name: "Optimizing", description: "Optimizing display", duration: 700 }
  ],
  TRENDING: [
    { id: 1, name: "Analyzing", description: "Analyzing trends", duration: 800 },
    { id: 2, name: "Ranking", description: "Ranking products", duration: 900 },
    { id: 3, name: "Loading", description: "Loading trending items", duration: 600 }
  ],
  HOT_SELLING: [
    { id: 1, name: "Calculating", description: "Calculating sales data", duration: 700 },
    { id: 2, name: "Ranking", description: "Finding bestsellers", duration: 1100 },
    { id: 3, name: "Loading", description: "Loading hot products", duration: 500 }
  ],
  ALL_PRODUCTS: [
    { id: 1, name: "Initializing", description: "Initializing product catalog", duration: 300 },
    { id: 2, name: "Fetching", description: "Loading product data", duration: 2000 },
    { id: 3, name: "Processing", description: "Processing product information", duration: 1000 },
    { id: 4, name: "Finalizing", description: "Preparing product display", duration: 500 }
  ]
};

// Network speed detection utility
export const detectNetworkSpeed = () => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0
    };
  }
  return { effectiveType: 'unknown', downlink: 0, rtt: 0 };
};