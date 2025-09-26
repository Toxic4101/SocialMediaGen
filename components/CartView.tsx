import React from 'react';
import { CartItem, AppView } from '../types';
import { Icon } from './Icon';

interface CartViewProps {
  cartItems: CartItem[];
  onRemoveFromCart: (productId: string) => void;
  onCheckout: (total: number, items: CartItem[]) => void;
  setView: (view: AppView) => void;
}

const CartView: React.FC<CartViewProps> = ({ cartItems, onRemoveFromCart, onCheckout, setView }) => {
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.onSale && item.salePrice !== undefined ? item.salePrice : item.price;
    return total + price * item.quantity;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-base-200 rounded-lg shadow-xl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setView(AppView.STORE)}
          className="p-2 rounded-full hover:bg-base-300 transition-colors"
          aria-label="Back to store"
        >
          <Icon name="back" className="w-6 h-6 text-primary" />
        </button>
        <h2 className="text-3xl font-bold text-primary">Your Cart</h2>
      </div>
      {cartItems.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map(item => {
              const price = item.onSale && item.salePrice !== undefined ? item.salePrice : item.price;
              const displayImage = item.imageUrl !== 'error' && item.imageUrl !== 'loading' ? item.imageUrl : undefined;

              return (
              <div key={item.id} className="flex items-center justify-between bg-base-300 p-4 rounded-md">
                <div className="flex items-center space-x-4">
                  <img src={displayImage} alt={item.name} className="w-16 h-16 rounded-md object-cover bg-base-100" />
                  <div>
                    <h3 className="font-semibold text-base-content">{item.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>${price.toFixed(2)} x {item.quantity}</span>
                        {item.onSale && <span className="text-xs font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">SALE</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="font-bold text-lg text-primary">${(price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-base-100 rounded-full transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Icon name="trash" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )})}
          </div>

          <div className="mt-8 pt-6 border-t border-base-300">
            <div className="flex justify-end items-center text-xl font-bold">
              <span className="text-gray-400 mr-4">Total:</span>
              <span className="text-primary text-2xl">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => onCheckout(cartTotal, cartItems)}
                className="bg-primary text-primary-content font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-primary-focus transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ml-auto"
              >
                <Icon name="dollar" className="w-5 h-5"/>
                Checkout with PayFast
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartView;
