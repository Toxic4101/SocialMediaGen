import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { Icon } from './Icon';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onAskAi: (product: Product) => void;
  onProductView: (productId: string) => void;
  isAiOnCooldown: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onAddToCart,
  onAskAi,
  onProductView,
  isAiOnCooldown,
}) => {
  const publishedProducts = products.filter(p => p.status === 'published');

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-base-content border-b border-base-300 pb-2 mb-4">Live Products</h2>
      {publishedProducts.length === 0 ? (
        <div className="text-center py-10 px-6 bg-base-200 rounded-lg">
            <Icon name="store" className="w-12 h-12 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold text-base-content">Your Store is Empty!</h2>
            <p className="text-gray-400 mt-2 max-w-md mx-auto">
              Use the Admin Panel to generate your first product drafts and launch your business.
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {publishedProducts.map(product => (
            <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onAskAi={onAskAi}
                onProductView={onProductView}
                isAiOnCooldown={isAiOnCooldown}
            />
            ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
