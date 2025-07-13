import React, { useState, useEffect } from 'react';
import { getProductReviews, getProductReviewStats } from '@/services/reviews';
import StarRating from './StarRating';
import { Skeleton } from './ui/skeleton';
import { User, Calendar } from 'lucide-react';

interface ProductReviewsProps {
  productId: number;
  skuId?: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, skuId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const [visibleReviews, setVisibleReviews] = useState(5); // Show 5 reviews initially
  
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // Fetch reviews with productId filter
        const url = `https://api.dharaniherbbals.com/api/product-reviews?filters[productId][$eq]=${productId}&filters[isActive][$eq]=true&pagination[limit]=-1&sort=createdAt:desc`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.data && Array.isArray(data.data)) {
          
          // Filter reviews by productId
          const apiReviews = data.data
            .filter(item => {
              // Filter by productId if it exists
              const reviewProductId = item.attributes?.productId;
              if (reviewProductId && reviewProductId.toString() === productId.toString()) {
                return true;
              }
              
              // Filter by skuId if it exists
              const reviewSkuId = item.attributes?.skuId;
              if (skuId && reviewSkuId && reviewSkuId.toString() === skuId.toString()) {
                return true;
              }
              
              // Only show active reviews
              return item.attributes?.isActive === true;
            })
            .map(item => ({
              id: item.id,
              rating: item.attributes?.rating || 5,
              comment: item.attributes?.comment || 'Great product!',
              createdAt: item.attributes?.createdAt || new Date().toISOString(),
              // Use userName field directly
              userName: item.attributes?.userName || 'Customer',
              // Add productId and productName
              productId: item.attributes?.productId || productId.toString(),
              productName: item.attributes?.productName || ''
            }));
          

          
          // Use the API reviews if available, otherwise use fallback
          if (apiReviews.length > 0) {
            setReviews(apiReviews);
            
            // Calculate stats from API reviews
            const ratings = apiReviews.map(r => r.rating).filter(r => r >= 1 && r <= 5);
            if (ratings.length > 0) {
              const total = ratings.reduce((sum, r) => sum + r, 0);
              const avg = total / ratings.length;
              
              setStats({
                average: parseFloat(avg.toFixed(1)),
                count: apiReviews.length
              });
            } else {
              setStats({ average: 0, count: 0 });
            }
          } else {
            // No reviews found - set empty state
            setReviews([]);
            setStats({ average: 0, count: 0 });
          }
        }
      } catch (error) {
        // Set empty state on error
        setReviews([]);
        setStats({ average: 0, count: 0 });
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId, skuId]);
  
  const loadMoreReviews = () => {
    setVisibleReviews(reviews.length); // Show all reviews
  };

  if (loading) {
    return <ReviewsSkeleton />;
  }

  // Always show reviews (either real or mock)

  // Calculate rating distribution - ensure we have values for all ratings
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(review => {
    if (review && review.rating && review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
    }
  });
  
  // Don't add mock data for rating distribution


  
  // Reviews should always be available now from the service
  
  return (
    <div className="space-y-4">
      {/* Reviews Summary */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Average Rating */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.average > 0 ? stats.average.toFixed(1) : '0.0'}</div>
            <StarRating rating={stats.average} size="md" showCount={false} />
            <div className="mt-1 text-gray-600 text-sm">{stats.count} reviews</div>
          </div>
          
          {/* Rating Distribution */}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Rating Distribution</h4>
            {[5, 4, 3, 2, 1].map(rating => {
              const count = ratingCounts[rating] || 0;
              const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center mb-2">
                  <div className="w-12 text-sm font-medium text-gray-700">{rating} stars</div>
                  <div className="flex-1 mx-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-8 text-xs text-gray-500 text-right">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Customer Reviews</h3>
        <div className="space-y-3">
          {reviews.slice(0, visibleReviews).map((review, index) => (
            <div key={index} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <StarRating rating={review.rating || 5} size="sm" showCount={false} />
                  <h4 className="font-semibold mt-1">
                    {review.userName || 'Customer'}
                  </h4>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
          
          {reviews.length > visibleReviews && (
            <div className="text-center mt-6">
              <button 
                onClick={loadMoreReviews}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                See More Reviews ({reviews.length - visibleReviews} more)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReviewsSkeleton = () => (
  <div className="space-y-8">
    <div className="bg-gray-50 p-6 rounded-2xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex flex-col items-center justify-center">
          <Skeleton className="h-10 w-16 mb-2" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-4 w-40 mb-3" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center mb-2">
              <Skeleton className="h-4 w-12" />
              <div className="flex-1 mx-3">
                <Skeleton className="h-2 w-full" />
              </div>
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
    
    <div className="space-y-6">
      <Skeleton className="h-6 w-40" />
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

export default ProductReviews;