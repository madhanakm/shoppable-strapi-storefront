export interface Review {
  id?: number;
  user: number;
  product: number;
  rating: number;
  comment: string;
  isActive: boolean;
  skuId?: string;
  userName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewStats {
  average: number;
  count: number;
}

export const submitReview = async (reviewData: {
  user: number;
  product: number;
  rating: number;
  comment: string;
  skuId?: string;
  userName?: string;
  productName?: string;
}): Promise<any> => {
  const response = await fetch('https://api.dharaniherbbals.com/api/product-reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        userId: reviewData.user.toString(),
        userName: reviewData.userName || 'Customer',
        productId: reviewData.product.toString(),
        productName: reviewData.productName || '',
        rating: reviewData.rating,
        comment: reviewData.comment,
        skuId: reviewData.skuId || '',
        isActive: false
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to submit review (${response.status})`);
  }

  return response.json();
};

export const getProductReviews = async (productId: number, skuId?: string): Promise<Review[]> => {
  if (!productId || isNaN(productId) || productId <= 0) return [];

  try {
    let url = `https://api.dharaniherbbals.com/api/product-reviews?filters[productId][$eq]=${productId}&filters[isActive][$eq]=true`;
    if (skuId) url += `&filters[skuId][$eq]=${skuId}`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    const reviews = data.data || [];

    return reviews.map((item: any) => ({
      id: item.id,
      user: parseInt(item.attributes?.userId) || 0,
      product: parseInt(item.attributes?.productId) || productId,
      rating: item.attributes?.rating || 0,
      comment: item.attributes?.comment || '',
      isActive: item.attributes?.isActive === true,
      skuId: item.attributes?.skuId || '',
      userName: item.attributes?.userName || 'Customer',
      createdAt: item.attributes?.createdAt || new Date().toISOString(),
      updatedAt: item.attributes?.updatedAt || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
};

export const getProductReviewStats = async (productId: number, skuId?: string | number): Promise<{ average: number; count: number }> => {
  if (!productId || isNaN(productId) || productId <= 0) return { average: 0, count: 0 };

  try {
    const reviews = await getProductReviews(productId);
    const filtered = skuId ? reviews.filter(r => r.skuId === skuId.toString()) : reviews;
    const valid = filtered.map(r => r.rating).filter(r => r >= 1 && r <= 5);
    if (valid.length === 0) return { average: 0, count: 0 };
    const average = valid.reduce((sum, r) => sum + r, 0) / valid.length;
    return { average: parseFloat(average.toFixed(1)), count: valid.length };
  } catch {
    return { average: 0, count: 0 };
  }
};

export const getBulkProductReviewStats = async (productIds: number[]): Promise<Record<number, { average: number; count: number }>> => {
  if (!productIds || productIds.length === 0) return {};

  try {
    const validIds = productIds.filter(id => id && !isNaN(id) && id > 0);
    if (validIds.length === 0) return {};

    const response = await fetch('https://api.dharaniherbbals.com/api/product-reviews?filters[isActive][$eq]=true&pagination[pageSize]=200');
    if (!response.ok) return {};

    const data = await response.json();
    const reviews = data.data || [];

    const stats: Record<number, number[]> = {};
    reviews.forEach((item: any) => {
      const productId = parseInt(item.attributes?.productId);
      const rating = item.attributes?.rating;
      if (!isNaN(productId) && rating >= 1 && rating <= 5) {
        if (!stats[productId]) stats[productId] = [];
        stats[productId].push(rating);
      }
    });

    const result: Record<number, { average: number; count: number }> = {};
    Object.entries(stats).forEach(([id, ratings]) => {
      const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      result[parseInt(id)] = { average: parseFloat(average.toFixed(1)), count: ratings.length };
    });

    return result;
  } catch {
    return {};
  }
};
