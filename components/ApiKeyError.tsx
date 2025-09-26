import React from 'react';

interface ApiKeyErrorProps {
    customError?: string | null;
}

const ApiKeyError: React.FC<ApiKeyErrorProps> = ({ customError }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-base-100">
      <div className="max-w-2xl mx-auto text-center py-20 px-6 bg-base-200 rounded-lg shadow-xl border border-red-500/30">
        <div className="w-20 h-20 mx-auto bg-red-500 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-red-400 mb-3">Configuration Error</h2>
        <p className="text-gray-400 mb-2">
          {customError || "The application cannot start because the Gemini API key is missing."}
        </p>
         <p className="text-sm text-gray-300 mt-4">
          Please ensure the <code className="bg-base-300 px-1 rounded-sm">API_KEY</code> environment variable is correctly configured and accessible to this application.
          <br/>
          Please check the instructions in `README.md`.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyError;
