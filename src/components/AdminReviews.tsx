import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Check, X, Eye, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PendingReview {
  id: number;
  attributes: {
    user: number;
    product: number;
    rating: number;
    comment: string;
    isActive: boolean;
    skuId?: string;
    createdAt: string;
    user_info?: {
      data: {
        attributes: {
          username: string;
          email: string;
        };
      };
    };
    product_info?: {
      data: {
        attributes: {
          Name: string;
          photo?: string;
        };
      };
    };
  };
}

const AdminReviews: React.FC = () => {
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://api.dharaniherbbals.com/api/product-reviews?filters[isActive][$eq]=false&populate[user][fields][0]=username&populate[user][fields][1]=email&populate[product][fields][0]=Name&populate[product][fields][1]=photo&sort=createdAt:desc'
      );
      
      if (response.ok) {
        const data = await response.json();
        setPendingReviews(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending reviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: number, isActive: boolean) => {
    try {
      const response = await fetch(`https://api.dharaniherbbals.com/api/product-reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            isActive: isActive
          }
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Review ${isActive ? 'approved' : 'rejected'} successfully`
        });
        
        // Remove the review from pending list
        setPendingReviews(prev => prev.filter(review => review.id !== reviewId));
      } else {
        throw new Error('Failed to update review status');
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p>Loading pending reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Review Management</h1>
        <p className="text-gray-600">
          Manage pending product reviews - approve or reject customer feedback
        </p>
      </div>

      {pendingReviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Pending Reviews</h3>
            <p className="text-gray-500">All reviews have been processed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Pending Reviews ({pendingReviews.length})
            </h2>
            <Button onClick={fetchPendingReviews} variant="outline" size="sm">
              Refresh
            </Button>
          </div>

          {pendingReviews.map((review) => (
            <Card key={review.id} className="border-l-4 border-l-yellow-400">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {renderStars(review.attributes.rating)}
                    </div>
                    <Badge variant="secondary">
                      {review.attributes.rating}/5 Stars
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(review.attributes.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Product Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {review.attributes.product_info?.data?.attributes?.photo && (
                    <img
                      src={review.attributes.product_info.data.attributes.photo}
                      alt="Product"
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">
                      {review.attributes.product_info?.data?.attributes?.Name || 'Product'}
                    </p>
                    {review.attributes.skuId && (
                      <p className="text-sm text-gray-500">SKU: {review.attributes.skuId}</p>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>
                    {review.attributes.user_info?.data?.attributes?.username || 'Anonymous Customer'}
                  </span>
                </div>

                {/* Review Comment */}
                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-gray-800 leading-relaxed">
                    "{review.attributes.comment}"
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={() => updateReviewStatus(review.id, true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => updateReviewStatus(review.id, false)}
                    variant="destructive"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;