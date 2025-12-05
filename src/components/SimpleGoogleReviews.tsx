import React from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

interface SimpleGoogleReviewsProps {
  businessName: string;
  googleMapsUrl: string;
  rating?: number;
  reviewCount?: number;
}

const SimpleGoogleReviews: React.FC<SimpleGoogleReviewsProps> = ({
  businessName,
  googleMapsUrl,
  rating = 4.8,
  reviewCount = 150
}) => {
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="w-full px-4">
      <div className="text-center mb-8">
        <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 ${isTamil ? 'tamil-text' : ''}`}>
          {translate('home.ourValuableCustomerReviews')}
        </h2>
        
        {/* Google Rating Display */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
              alt="Google" 
              className="w-8 h-8"
            />
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">{rating}</span>
                <div className="flex">{renderStars(rating)}</div>
              </div>
              <p className={`text-gray-600 text-sm ${isTamil ? 'tamil-text' : ''}`}>
                {translate('home.basedOnReviews').replace('{count}', reviewCount.toString())}
              </p>
            </div>
          </div>
          
          <a
            href="https://search.google.com/local/writereview?placeid=ChIJ250X1r3hqDsRovG6bJOBLwg"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base ${isTamil ? 'tamil-text' : ''}`}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {translate('home.writeReview')}
          </a>
          

        </div>

        {/* Auto-scrolling Reviews */}
        <div className="bg-white rounded-lg shadow-lg p-3 md:p-6 overflow-hidden">
          <div className="flex animate-scroll space-x-3 md:space-x-6">
            {(() => {
              const reviews = [
                { name: "Priya S", rating: 5, text: "Excellent herbal products! Very effective and natural. Highly recommended.", time: "2 weeks ago" },
                { name: "Rajesh K", rating: 5, text: "Great quality products. Fast delivery and good customer service.", time: "1 month ago" },
                { name: "Meera R", rating: 4, text: "Good herbal medicines. Helped with my health issues. Will order again.", time: "3 weeks ago" },
                { name: "Suresh M", rating: 5, text: "Authentic Ayurvedic products. Very satisfied with the results.", time: "2 months ago" },
                { name: "Lakshmi V", rating: 5, text: "Pure and natural products. Excellent for wellness. Thank you!", time: "1 week ago" },
                { name: "Anitha K", rating: 5, text: "Amazing results with their herbal supplements. Will definitely buy again.", time: "1 month ago" },
                { name: "Venkat R", rating: 4, text: "Good quality herbal products. Packaging was excellent and delivery was quick.", time: "3 weeks ago" },
                { name: "Divya M", rating: 5, text: "Traditional Ayurvedic medicines that actually work. Highly satisfied!", time: "2 weeks ago" },
                { name: "Kumar S", rating: 5, text: "Best herbal store online. Genuine products and reasonable prices.", time: "1 week ago" },
                { name: "Sangeetha P", rating: 4, text: "Natural and effective products. Customer service is also very helpful.", time: "4 weeks ago" }
              ];
              return [...reviews, ...reviews].map((review, index) => (
              <div key={index} className="flex-shrink-0 w-64 md:w-80 bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 md:p-4 border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm md:text-base">{review.name}</div>
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-xs text-gray-500">{review.time}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-xs md:text-sm leading-relaxed">{review.text}</p>
              </div>
              ));
            })()}
          </div>
        </div>
        
        {/* View All Reviews Button */}
        <div className="text-center mt-8">
          <a
            href="https://www.google.com/maps/place/Dharani+Herbbals/@11.3580785,77.1641708,17z/data=!4m8!3m7!1s0x3ba8e1bdd6179ddb:0x82f81936cbaf1a2!8m2!3d11.3580361!4d77.166633!9m1!1b1!16s%2Fg%2F11c6f588fq!5m1!1e1?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium ${isTamil ? 'tamil-text' : ''}`}
          >
            <Star className="w-4 h-4 mr-2" />
            {translate('home.viewAllReviews')}
          </a>
        </div>
        
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 15s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    </div>
  );
};

export default SimpleGoogleReviews;