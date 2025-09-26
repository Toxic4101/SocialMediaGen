import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

interface PayFastGatewayViewProps {
  onConfirmPayment: () => void;
  onCancelPayment: () => void;
  cartTotal: number;
}

const PayFastGatewayView: React.FC<PayFastGatewayViewProps> = ({ onConfirmPayment, onCancelPayment, cartTotal }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer: number; // Use 'number' for browser compatibility
    if (isProcessing && countdown > 0) {
      timer = window.setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isProcessing && countdown === 0) {
      onConfirmPayment();
    }
    return () => clearTimeout(timer);
  }, [isProcessing, countdown, onConfirmPayment]);

  const handleConfirm = () => {
    setIsProcessing(true);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-base-200 rounded-lg shadow-xl border border-primary/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">PayFast Gateway</h2>
        <p className="text-sm text-gray-400 mb-6">This is a simulated payment gateway for demonstration.</p>
        
        <div className="bg-base-300 rounded-lg p-6 my-6">
            <p className="text-gray-400">Total Amount</p>
            <p className="text-4xl font-bold text-primary-content tracking-tight">${cartTotal.toFixed(2)}</p>
        </div>

        {isProcessing ? (
           <div className="flex flex-col items-center justify-center p-4 bg-base-300 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-3"></div>
                <p className="font-semibold text-primary">Processing payment...</p>
                <p className="text-sm text-gray-400">Redirecting back to store in {countdown}s</p>
            </div>
        ) : (
             <div className="space-y-3">
                <button
                    onClick={handleConfirm}
                    className="w-full bg-primary text-primary-content font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition-colors duration-300 flex items-center justify-center gap-2"
                >
                    <Icon name="check" className="w-5 h-5" />
                    Confirm Payment of ${cartTotal.toFixed(2)}
                </button>
                <button
                    onClick={onCancelPayment}
                    className="w-full text-gray-400 font-semibold py-2 px-6 rounded-lg hover:bg-base-300 transition-colors duration-300"
                >
                    Cancel and Return to Cart
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default PayFastGatewayView;
