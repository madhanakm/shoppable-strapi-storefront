import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { submitReview } from '@/services/reviews';
import { useToast } from '@/hooks/use-toast';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

interface ReviewFormProps {
  productId: number;
  skuId?: string;
  productName?: string;
  onReviewSubmitted?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, skuId, productName, onReviewSubmitted }) => {
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: ''
  });

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast({
        title: isTamil ? 'உள்நுழைவு தேவை' : "Login Required",
        description: isTamil ? 'விமர்சனத்தைச் சமர்ப்பிக்க உள்நுழையவும்' : "Please login to submit a review",
        variant: "destructive"
      });
      return;
    }

    if (formData.rating === 0) {
      toast({
        title: isTamil ? 'மதிப்பீடு தேவை' : "Rating Required",
        description: isTamil ? 'தயவுசெய்து ஒரு மதிப்பீட்டைத் தேர்ந்தெடுக்கவும்' : "Please select a rating",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReview({
        user: user.id,
        product: productId,
        rating: formData.rating,
        comment: formData.comment,
        skuId: skuId,
        // Add user name for text-based storage
        userName: user.username || user.email || 'Customer',
        // Add product name if available
        productName: productName || ''
      });
      
      toast({
        title: isTamil ? 'விமர்சனம் சமர்ப்பிக்கப்பட்டது' : "Review Submitted",
        description: isTamil ? 'உங்கள் விமர்சனம் அங்கீகாரத்திற்காகக் காத்திருக்கிறது மற்றும் அங்கீகரிக்கப்பட்டவுடன் காணப்படும்.' : "Your review is pending approval and will be visible once approved."
      });
      
      setFormData({ rating: 0, comment: '' });
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      toast({
        title: isTamil ? 'பிழை' : "Error",
        description: isTamil ? 'விமர்சனத்தைச் சமர்ப்பிக்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.' : "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className={`text-gray-600 ${isTamil ? 'tamil-text' : ''}`}>
          {isTamil ? 'விமர்சனத்தை எழுத உள்நுழையவும்' : 'Please login to write a review'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border space-y-4">
      <h3 className={`text-lg font-semibold ${isTamil ? 'tamil-text' : ''}`}>
        {isTamil ? 'விமர்சனத்தை எழுதுங்கள்' : 'Write a Review'}
      </h3>
      
      <div>
        <Label className={isTamil ? 'tamil-text' : ''}>
          {isTamil ? 'மதிப்பீடு' : 'Rating'}
        </Label>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              className="p-1"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= formData.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="comment" className={isTamil ? 'tamil-text' : ''}>
          {isTamil ? 'உங்கள் விமர்சனம்' : 'Your Review'}
        </Label>
        <Textarea
          id="comment"
          value={formData.comment}
          onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
          placeholder={isTamil ? 'இந்தத் தயாரிப்புடனான உங்கள் அனுபவத்தைப் பகிரவும்' : 'Share your experience with this product'}
          rows={4}
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        <span className={isTamil ? 'tamil-text' : ''}>
          {isSubmitting 
            ? (isTamil ? 'சமர்ப்பிக்கிறது...' : 'Submitting...') 
            : (isTamil ? 'விமர்சனத்தைச் சமர்ப்பிக்கவும்' : 'Submit Review')}
        </span>
      </Button>
    </form>
  );
};

export default ReviewForm;