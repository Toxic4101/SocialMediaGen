import React from 'react';
import { RecommendedProduct, Product } from '../types';
import ProductCard from './ProductCard';

interface RecommendationEngineProps {
  products: RecommendedProduct[];
  onAddToCart: (product: Product) => void;
  onAskAi: (product: Product) => void;
  onProductView: (productId: string) => void;
  isAiOnCooldown: boolean;
}

const recommendationTypeStyles = {
    TOP_SELLER: "border-yellow-400 bg-yellow-400/10 text-yellow-300",
    TRENDING: "border-indigo-400 bg-indigo-400/10 text-indigo-300",
    SPECIAL_OFFER: "border-red-400 bg-red-400/10 text-red-300",
    PERSONALIZED: "border-teal-400 bg-teal-400/10 text-teal-300",
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ products, onAddToCart, onAskAi, onProductView, isAiOnCooldown }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-base-content border-b border-base-300 pb-2 mb-4">✨ Recommended For You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {products.map(product => (
          <div key={product.id} className="flex flex-col gap-2">
             <div className={`p-2 rounded-md border-l-4 ${recommendationTypeStyles[product.recommendationType]}`}>
                 <p className="text-xs font-semibold italic">"{product.recommendationReason}"</p>
            </div>
            <ProductCard 
              product={product}
              onAddToCart={onAddToCart}
              onAskAi={onAskAi}
              onProductView={onProductView}
              isAiOnCooldown={isAiOnCooldown}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationEngine;