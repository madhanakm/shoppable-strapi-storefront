
import React, { useState } from 'react';
import { getProductReviews } from '@/services/reviews';
import StarRating from './StarRating';
import { Skeleton } from './ui/skeleton';
import { User, Calendar } from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import { useQuery } from '@tanstack/react-query';

interface ProductReviewsProps {
  productId: number;
  skuId?: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, skuId }) => {
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  const [visibleReviews, setVisibleReviews] = useState(5); // Show 5 reviews initially

  const {
    data: reviews = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['productReviews', productId, skuId],
    queryFn: () => getProductReviews(productId, skuId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Calculate stats from reviews
  const ratings = reviews.map(r => r.rating).filter(r => r >= 1 && r <= 5);
  const stats = ratings.length > 0
    ? {
        average: parseFloat((ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)),
        count: reviews.length
      }
    : { average: 0, count: 0 };

  const loadMoreReviews = () => {
    setVisibleReviews(reviews.length); // Show all reviews
  };

  if (isLoading) return <ReviewsSkeleton />;
  if (isError) return <div>Error loading reviews.</div>;
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className={isTamil ? 'tamil-text' : ''}>{isTamil ? 'இன்னும் விமர்சனங்கள் இல்லை. முதலில் விமர்சனம் இடுங்கள்!' : 'No reviews yet. Be the first to review!'}</p>
      </div>
    );
  }

  // Calculate rating distribution
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
    }
  });
  
  return (
    <div className="space-y-4">
      {/* Reviews Summary */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Average Rating */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.average > 0 ? stats.average.toFixed(1) : '0.0'}</div>
            <StarRating rating={stats.average} size="md" showCount={false} />
            <div className={`mt-1 text-gray-600 text-sm ${isTamil ? 'tamil-text' : ''}`}>{stats.count} {translate('ui.reviews')}</div>
          </div>
          
          {/* Rating Distribution */}
          <div className="flex-1">
            <h4 className={`text-sm font-semibold text-gray-700 mb-3 ${isTamil ? 'tamil-text' : ''}`}>{isTamil ? 'மதிப்பீட்டு விநியோகம்' : 'Rating Distribution'}</h4>
            {[5, 4, 3, 2, 1].map(rating => {
              const count = ratingCounts[rating] || 0;
              const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center mb-2">
                  <div className={`w-12 text-sm font-medium text-gray-700 ${isTamil ? 'tamil-text' : ''}`}>{rating} {isTamil ? 'நட்சத்திரங்கள்' : 'stars'}</div>
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
        <h3 className={`text-base font-semibold ${isTamil ? 'tamil-text' : ''}`}>{translate('product.reviews')}</h3>
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
              <p className="text-gray-700 text-sm md:text-base text-justify">{review.comment}</p>
            </div>
          ))}
          
          {reviews.length > visibleReviews && (
            <div className="text-center mt-6">
              <button 
                onClick={loadMoreReviews}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                {isTamil ? 'மேலும் விமர்சனங்களைக் காண்க' : 'See More Reviews'} ({reviews.length - visibleReviews} {isTamil ? 'மேலும்' : 'more'})
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