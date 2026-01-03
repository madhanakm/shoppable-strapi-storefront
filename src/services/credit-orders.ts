import { UserType } from '@/types/strapi';

export const canPlaceCreditOrder = (userType?: UserType): boolean => {
  return userType !== UserType.CUSTOMER && userType !== undefined;
};
