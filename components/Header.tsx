import React from 'react';
import { Icon } from './Icon';
import { AppView } from '../types';

interface HeaderProps {
  cartItemCount: number;
  setView: (view: AppView) => void;
  onAdminClick: () => void;
  onInfoClick: () => void;
  isAiOnCooldown: boolean;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount, setView, onAdminClick, onInfoClick, isAiOnCooldown }) => {
  return (
    <header className="bg-base-200/80 backdrop-blur-md sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setView(AppView.STORE)}
          >
            <span className="text-2xl font-bold text-primary">
                ✨
            </span>
            <h1 className="text-xl font-bold text-base-content">Cortex Commerce</h1>
          </div>
          <div className="flex items-center space-x-2">
            
            {isAiOnCooldown && (
                <div title="AI is on cooldown due to API rate limits" className="flex items-center gap-1.5 p-2 rounded-full bg-yellow-900/50 animate-pulse">
                    <Icon name="info" className="w-5 h-5 text-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-400 hidden md:block">COOLDOWN</span>
                </div>
            )}

            <button
              onClick={onInfoClick}
              className="p-2 rounded-full hover:bg-base-300 transition-colors"
              aria-label="About this program"
            >
              <Icon name="info" className="w-6 h-6 text-primary" />
            </button>
             <button
              onClick={onAdminClick}
              className="p-2 rounded-full hover:bg-base-300 transition-colors"
              aria-label="Open admin panel"
            >
              <Icon name="gear" className="w-6 h-6 text-primary" />
            </button>
            
             <button
              onClick={() => setView(AppView.ORDER_HISTORY)}
              className="p-2 rounded-full hover:bg-base-300 transition-colors"
              aria-label="Order History"
            >
              <Icon name="document-text" className="w-6 h-6 text-primary" />
            </button>
            <button
              onClick={() => setView(AppView.CART)}
              className="relative p-2 rounded-full hover:bg-base-300 transition-colors"
              aria-label="Open cart"
            >
              <Icon name="cart" className="w-6 h-6 text-primary" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-white text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;