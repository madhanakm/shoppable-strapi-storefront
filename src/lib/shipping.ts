import { EcommerceSettings } from '@/services/ecommerce-settings';
import { StateShippingRate, getStateShippingRates, findStateShippingRate } from '@/services/state-shipping';

export interface ShippingCalculationParams {
  cartTotal: number;
  state: string;
  ecomSettings: EcommerceSettings;
  stateRates?: StateShippingRate[];
}

export interface ShippingResult {
  charges: number;
  isFree: boolean;
  isTamilNadu: boolean;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
  stateName?: string;
}

/**
 * Calculate shipping charges using database state rates
 */
export const calculateShipping = async ({
  cartTotal,
  state,
  ecomSettings,
  stateRates
}: ShippingCalculationParams): Promise<ShippingResult> => {
  const rates = stateRates || await getStateShippingRates();
  const stateRate = findStateShippingRate(rates, state);
  
  if (stateRate && stateRate.isActive) {
    const shippingCharges = parseInt(stateRate.shippingRate);
    const freeThreshold = parseInt(stateRate.freeShippingThreshold);
    const isFreeShippingDisabled = freeThreshold === -1;
    const isFree = !isFreeShippingDisabled && cartTotal >= freeThreshold;
    
    return {
      charges: isFree ? 0 : shippingCharges,
      isFree,
      isTamilNadu: stateRate.stateCode === 'TN',
      freeShippingThreshold: freeThreshold,
      remainingForFreeShipping: isFreeShippingDisabled ? 0 : Math.max(0, freeThreshold - cartTotal),
      stateName: stateRate.stateName
    };
  }
  
  // Fallback to old logic
  return calculateShippingSync({ cartTotal, state, ecomSettings });
};

/**
 * Synchronous version for backward compatibility
 */
export const calculateShippingSync = ({
  cartTotal,
  state,
  ecomSettings
}: Omit<ShippingCalculationParams, 'stateRates'>): ShippingResult => {
  const normalizedState = state.toLowerCase().replace(/\s+/g, '');
  const isTamilNadu = normalizedState.includes('tamilnadu') || 
                     normalizedState === 'tn' ||
                     (normalizedState.includes('tamil') && normalizedState.includes('nadu'));
  
  const tamilNaduShipping = parseInt(ecomSettings.tamilNaduShipping || '50');
  const otherStateShipping = parseInt(ecomSettings.otherStateShipping || '150');
  const tamilNaduFreeShipping = parseInt(ecomSettings.tamilNaduFreeShipping || '750');
  const otherStateFreeShipping = parseInt(ecomSettings.otherStateFreeShipping || '1000');
  
  const freeShippingThreshold = isTamilNadu ? tamilNaduFreeShipping : otherStateFreeShipping;
  const baseShippingCharges = isTamilNadu ? tamilNaduShipping : otherStateShipping;
  const isFreeShippingDisabled = freeShippingThreshold === -1;
  const isFree = !isFreeShippingDisabled && cartTotal >= freeShippingThreshold;
  
  return {
    charges: isFree ? 0 : baseShippingCharges,
    isFree,
    isTamilNadu,
    freeShippingThreshold,
    remainingForFreeShipping: isFreeShippingDisabled ? 0 : Math.max(0, freeShippingThreshold - cartTotal)
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