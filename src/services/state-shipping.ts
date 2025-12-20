import { get } from './api';

export interface StateShippingRate {
  id: number;
  stateName: string;
  stateCode: string;
  shippingRate: string;
  freeShippingThreshold: string;
  minimumOrderValue: string;
  isActive: boolean;
}

export interface StateShippingResponse {
  data: Array<{
    id: number;
    attributes: StateShippingRate;
  }>;
}

/**
 * Fetch all state shipping rates from Strapi
 */
export const getStateShippingRates = async (): Promise<StateShippingRate[]> => {
  try {
    const response = await get<StateShippingResponse>('/state-shipping-rates?pagination[pageSize]=100');
    
    return response.data.map(item => ({
      id: item.id,
      stateName: item.attributes.stateName,
      stateCode: item.attributes.stateCode,
      shippingRate: item.attributes.shippingRate,
      freeShippingThreshold: item.attributes.freeShippingThreshold,
      minimumOrderValue: item.attributes.minimumOrderValue,
      isActive: item.attributes.isActive
    }));
  } catch (error) {
    console.error('Failed to fetch state shipping rates:', error);
    return [];
  }
};

/**
 * Find shipping rate for a specific state
 */
export const findStateShippingRate = (
  rates: StateShippingRate[], 
  stateName: string
): StateShippingRate | null => {
  const normalizedInput = stateName.toLowerCase().replace(/\s+/g, '');
  
  // Try exact match first
  let match = rates.find(rate => 
    rate.stateName.toLowerCase().replace(/\s+/g, '') === normalizedInput ||
    rate.stateCode.toLowerCase() === normalizedInput
  );
  
  if (match) return match;
  
  // Try partial match for common variations
  match = rates.find(rate => {
    const normalizedStateName = rate.stateName.toLowerCase().replace(/\s+/g, '');
    return normalizedStateName.includes(normalizedInput) || 
           normalizedInput.includes(normalizedStateName);
  });
  
  return match || null;
};