import React from 'react';
import { AppView } from '../types';
import { Icon } from './Icon';

interface ConfirmationViewProps {
  setView: (view: AppView) => void;
}

const ConfirmationView: React.FC<ConfirmationViewProps> = ({ setView }) => {
  return (
    <div className="max-w-2xl mx-auto text-center py-20 px-6 bg-base-200 rounded-lg shadow-xl relative">
       <button
        onClick={() => setView(AppView.STORE)}
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-base-300 transition-colors"
        aria-label="Back to store"
      >
        <Icon name="back" className="w-6 h-6 text-primary" />
      </button>
      <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h2 className="text-3xl font-bold text-base-content mb-3">Thank You For Your Order!</h2>
      <p className="text-gray-400 mb-8">
        Your transaction has been successfully processed. A confirmation receipt and your product access details will be sent to your email address shortly.
      </p>
      <button
        onClick={() => setView(AppView.STORE)}
        className="bg-primary text-primary-content font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition-colors duration-300"
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default ConfirmationView;
