import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { updatePendingOrderStatus } from '@/services/pending-orders';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const MobilePayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const paymentDataString = searchParams.get('data');
        const orderNumber = searchParams.get('orderNumber');
        
        if (!paymentDataString || !orderNumber) {
          throw new Error('Missing payment data');
        }

        const paymentData = JSON.parse(decodeURIComponent(paymentDataString));
        
        if (!window.Razorpay) {
          // Load Razorpay script
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => processPayment(paymentData, orderNumber);
          script.onerror = () => setError('Failed to load payment gateway');
          document.body.appendChild(script);
        } else {
          processPayment(paymentData, orderNumber);
        }
      } catch (err) {
        console.error('Payment initialization error:', err);
        setError('Failed to initialize payment');
        setLoading(false);
      }
    };

    const processPayment = (paymentData: any, orderNumber: string) => {
      const options = {
        ...paymentData,
        handler: async (response: any) => {
          try {
            // Update pending order status to processing
            await updatePendingOrderStatus(orderNumber, 'processing', response.razorpay_payment_id);
            
            // Redirect to success page with payment details
            window.location.href = `dharaniherbbals://payment-success?orderNumber=${orderNumber}&paymentId=${response.razorpay_payment_id}`;
          } catch (error) {
            console.error('Payment success handling error:', error);
            window.location.href = `dharaniherbbals://payment-error?orderNumber=${orderNumber}&error=${encodeURIComponent('Payment processing failed')}`;
          }
        },
        modal: {
          ondismiss: () => {
            window.location.href = `dharaniherbbals://payment-cancelled?orderNumber=${orderNumber}`;
          }
        }
      };

      // Handle payment failures
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', async (response: any) => {
        console.log('Payment failed:', response.error);
        await updatePendingOrderStatus(
          orderNumber, 
          'failed', 
          response.error.metadata?.payment_id,
          `Payment failed: ${response.error.description || response.error.reason}`
        );
        window.location.href = `dharaniherbbals://payment-error?orderNumber=${orderNumber}&error=${encodeURIComponent(response.error.description || 'Payment failed')}`;
      });
      
      rzp.open();
      setLoading(false);
    };

    initializePayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Initializing Payment...</h2>
          <p className="text-gray-500 mt-2">Please wait while we set up your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Payment Error</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = 'dharaniherbbals://payment-error'}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            Return to App
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MobilePayment;