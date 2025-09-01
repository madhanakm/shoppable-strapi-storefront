import { EcommerceSettings } from '@/services/ecommerce-settings';

export interface ShippingCalculationParams {
  cartTotal: number;
  state: string;
  ecomSettings: EcommerceSettings;
}

export interface ShippingResult {
  charges: number;
  isFree: boolean;
  isTamilNadu: boolean;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
}

/**
 * Calculate shipping charges based on cart total and delivery state
 */
export const calculateShipping = ({
  cartTotal,
  state,
  ecomSettings
}: ShippingCalculationParams): ShippingResult => {
  // Normalize state name for flexible matching
  const normalizedState = state.toLowerCase().replace(/\s+/g, '');
  
  // Check if state is Tamil Nadu with flexible matching
  const isTamilNadu = normalizedState.includes('tamilnadu') || 
                     normalizedState === 'tn' ||
                     (normalizedState.includes('tamil') && normalizedState.includes('nadu'));
  
  // Get shipping settings with defaults
  const tamilNaduShipping = parseInt(ecomSettings.tamilNaduShipping || '50');
  const otherStateShipping = parseInt(ecomSettings.otherStateShipping || '150');
  const tamilNaduFreeShipping = parseInt(ecomSettings.tamilNaduFreeShipping || '750');
  const otherStateFreeShipping = parseInt(ecomSettings.otherStateFreeShipping || '1000');
  
  // Determine shipping charges and thresholds based on state
  const freeShippingThreshold = isTamilNadu ? tamilNaduFreeShipping : otherStateFreeShipping;
  const baseShippingCharges = isTamilNadu ? tamilNaduShipping : otherStateShipping;
  
  // Check if free shipping is disabled (-1 value)
  const isFreeShippingDisabled = freeShippingThreshold === -1;
  
  // Check if eligible for free shipping (only if not disabled)
  const isFree = !isFreeShippingDisabled && cartTotal >= freeShippingThreshold;
  const charges = isFree ? 0 : baseShippingCharges;
  
  // Calculate remaining amount for free shipping (0 if disabled)
  const remainingForFreeShipping = isFreeShippingDisabled ? 0 : Math.max(0, freeShippingThreshold - cartTotal);
  
  return {
    charges,
    isFree,
    isTamilNadu,
    freeShippingThreshold,
    remainingForFreeShipping
  };
};

/**
 * Get shipping message for display
 */
export const getShippingMessage = (shippingResult: ShippingResult): string => {
  if (shippingResult.isFree) {
    return 'Free Shipping';
  }
  
  // Don't show free shipping message if threshold is -1 (disabled)
  if (shippingResult.remainingForFreeShipping > 0 && shippingResult.freeShippingThreshold !== -1) {
    return `Add ₹${shippingResult.remainingForFreeShipping} more for free shipping`;
  }
  
  return `Shipping: ₹${shippingResult.charges}`;
};