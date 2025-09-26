import React from 'react';
import { Icon } from './Icon';

interface InitializationScreenProps {
  onInitialize: () => void;
}

const InitializationScreen: React.FC<InitializationScreenProps> = ({ onInitialize }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-base-100">
      <div className="text-center p-8 bg-base-200 rounded-lg shadow-2xl max-w-lg mx-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl font-bold text-primary">✨</span>
            <h1 className="text-3xl font-bold text-base-content">Welcome to Cortex Commerce</h1>
        </div>
        <p className="text-gray-400 mb-8">
          This is a self-contained e-commerce store powered by an AI Co-pilot.
          <br/><br/>
          Click below to launch the store. You can then use the Admin Panel to command the AI to generate its first product drafts for your review.
        </p>
        <button
          onClick={onInitialize}
          className="bg-primary text-primary-content font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-primary-focus transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
        >
          <Icon name="store" className="w-6 h-6" />
          Launch Store
        </button>
      </div>
    </div>
  );
};

export default InitializationScreen;
