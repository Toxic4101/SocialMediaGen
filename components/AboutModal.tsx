import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-base-200 rounded-lg shadow-2xl p-6 w-full max-w-lg flex flex-col relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-base-300 font-bold text-2xl leading-none">&times;</button>
        <div className="flex items-center gap-3 mb-4">
           <span className="text-3xl font-bold text-primary">✨</span>
           <h2 className="text-2xl font-bold text-primary">About Cortex Commerce</h2>
        </div>
        <div className="text-sm text-gray-300 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          <p>
            Welcome to <strong className="text-primary-content">Cortex Commerce</strong>, an e-commerce simulation where you work with an AI co-pilot to run a digital product business.
          </p>
          <h3 className="font-bold text-base text-primary-content pt-2">AI Co-pilot Model:</h3>
           <p>
            This platform operates on an "AI Co-pilot" model. You are in control of the business strategy. Command the AI to generate product concepts, which will appear in the "Drafts" tab of the Admin Panel. From there, you can review, reject, or choose to publish a draft. When you publish, the AI takes over the creative work: enriching the product with compelling details, generating a unique image, and writing a promotional social media post.
          </p>
          <h3 className="font-bold text-base text-primary-content pt-2">Key Features:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-gray-100">Collaborative Business Strategy:</strong> This user-driven workflow ensures stability and prevents API errors, giving you full control over your product catalog.</li>
            <li><strong className="text-gray-100">AI-Powered Content Creation:</strong> The AI generates unique digital products, including names, descriptions, features, pricing, and AI-generated images.</li>
            <li><strong className="text-gray-100">Simulated Business Operations:</strong> A detailed Admin Panel provides a real-time look at the store's performance, including a financial dashboard, a marketing campaign overview, and an activity log to monitor the AI's decisions.</li>
             <li><strong className="text-gray-100">Realistic Checkout Simulation:</strong> The checkout process simulates a professional redirect to a "PayFast" payment gateway, providing an immersive and authentic e-commerce experience.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
