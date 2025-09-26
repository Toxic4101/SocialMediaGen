import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import LoadingSpinner from './LoadingSpinner';
import StarRating from './StarRating';
import { Icon } from './Icon';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onAskAi: (product: Product) => void;
  onProductView: (productId: string) => void;
  isAiOnCooldown: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart,
  onAskAi,
  onProductView,
  isAiOnCooldown,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  const prevImageUrlRef = useRef(product.imageUrl);

  const observer = React.useRef<IntersectionObserver | null>(null);
  const cardRef = React.useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        onProductView(product.id);
      }
    });
    if (node) observer.current.observe(node);
  }, [product.id, onProductView]);

  useEffect(() => {
    if (prevImageUrlRef.current === 'loading' && product.imageUrl !== 'loading' && product.imageUrl !== 'error') {
      setShowShimmer(true);
      const timer = setTimeout(() => {
        setShowShimmer(false);
      }, 1500); // Animation duration matches CSS
      return () => clearTimeout(timer);
    }
    prevImageUrlRef.current = product.imageUrl;
  }, [product.imageUrl]);

  const handleAddToCart = () => {
    if (isAdded) return;
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const isError = product.imageUrl === 'error';
  const isLoading = product.imageUrl === 'loading';
  
  const cardClasses = `
    bg-base-200 rounded-lg overflow-hidden shadow-lg flex flex-col relative
    ${isError
      ? 'opacity-60 border border-red-500/30' 
      : 'transition-transform duration-300 hover:scale-105 group'}
  `;

  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;
  
  const priceToDisplay = product.onSale ? product.salePrice : product.price;

  const renderImageContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center">
          <LoadingSpinner />
          <p className="text-xs text-gray-400 mt-2">Generating image...</p>
        </div>
      );
    }

    if (isError) {
      let retryTitle = "Image generation failed. An admin can retry from the panel.";
      
      return (
        <div className="text-center p-4 flex flex-col items-center justify-center text-red-400">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p className="text-sm font-semibold mt-2">Image Generation Failed</p>
          {product.imageError && (
            <p className="text-xs text-red-400/80 mt-1 max-w-full px-2">
              {product.imageError}
            </p>
          )}
        </div>
      );
    }

    return (
      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 ease-in-out" />
    );
  };


  return (
    <div className={cardClasses} ref={cardRef}>
      {product.onSale && (
          <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10 animate-pulse">
              SALE
          </div>
      )}
      <div className={`relative w-full aspect-square bg-base-300 flex items-center justify-center overflow-hidden ${showShimmer ? 'shimmer-wrapper' : ''}`}>
        {renderImageContent()}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-base-content truncate pr-2 flex-1" title={product.name}>{product.name}</h3>
            {averageRating > 0 && product.reviews && (
                <div className="flex items-center gap-1 flex-shrink-0">
                    <StarRating rating={averageRating} />
                    <span className="text-xs text-gray-400">({product.reviews.length})</span>
                </div>
            )}
        </div>
        <p className="text-sm text-gray-400 mt-1 flex-grow min-h-[40px]">{product.description}</p>
        
        {product.onSale && product.marketingSlogan && (
            <div className="my-2 p-2 bg-yellow-400/10 border-l-4 border-yellow-400 rounded">
                <p className="text-xs text-yellow-300 font-semibold italic">"{product.marketingSlogan}"</p>
            </div>
        )}
        
        {product.details && product.details.length > 0 && (
            <div className="my-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase">Key Features</h4>
                <ul className="text-xs text-gray-300 list-disc list-inside mt-1 space-y-0.5">
                    {product.details.map((detail, i) => <li key={i}>{detail}</li>)}
                </ul>
            </div>
        )}
        {product.usageInstructions && product.usageInstructions.length > 0 && (
            <div className="my-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase">Usage Instructions</h4>
                <ul className="text-xs text-gray-300 list-disc list-inside mt-1 space-y-0.5">
                    {product.usageInstructions.map((inst, i) => <li key={i}>{inst}</li>)}
                </ul>
            </div>
        )}

        <div className="flex justify-between items-center mt-auto pt-2">
           <div className="flex items-end gap-2">
                <span className={`text-xl font-semibold ${product.onSale ? 'text-red-500' : 'text-primary'}`}>
                    ${priceToDisplay?.toFixed(2)}
                </span>
                {product.onSale && (
                    <span className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</span>
                )}
            </div>
          <div className="flex items-center gap-2">
            <button
                onClick={() => onAskAi(product)}
                disabled={isAiOnCooldown}
                className="p-2 rounded-md font-semibold bg-secondary text-white hover:bg-indigo-600 transition-colors duration-300 transform group-hover:scale-110 disabled:bg-gray-500 disabled:cursor-not-allowed"
                aria-label={isAiOnCooldown ? "AI is on cooldown" : "Ask AI about this product"}
                title={isAiOnCooldown ? "AI is on cooldown due to API rate limits." : "Ask AI about this product"}
            >
                <Icon name="chat" className="w-5 h-5" />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isError || isLoading || isAdded}
              className={`flex items-center justify-center gap-2 w-[140px] text-primary-content px-4 py-2 rounded-md font-semibold transition-all duration-300 transform group-hover:scale-110 disabled:bg-gray-500 disabled:cursor-not-allowed ${isAdded ? 'bg-green-600' : 'bg-primary hover:bg-primary-focus'}`}
              aria-label={isAdded ? 'Added to cart' : (isError || isLoading ? 'Image is not available' : 'Add to Cart')}
            >
              {isAdded ? (
                <>
                  <Icon name="check" className="w-5 h-5" />
                  Added!
                </>
              ) : (
                'Add to Cart'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
