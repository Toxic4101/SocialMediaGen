import React, { useState } from 'react';
import { Order, AppView, Customer } from '../types';
import { Icon } from './Icon';

interface AccountViewProps {
  orders: Order[];
  setView: (view: AppView) => void;
  customer: Customer & { username: string };
}

const AccountView: React.FC<AccountViewProps> = ({ orders, setView, customer }) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;

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
        <div className="flex items-center gap-3">
          <Icon name="document-text" className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold text-primary">Your Order History</h2>
        </div>
      </div>

      <div className="bg-base-300 p-4 sm:p-6 rounded-lg mb-8 border border-primary/20">
        <h3 className="text-xl font-semibold text-primary-content mb-4 flex items-center gap-3">
            <Icon name="dollar" className="w-6 h-6 text-primary"/>
            <span>PayFast Account Summary</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-base-100 p-3 rounded-md">
                <p className="text-sm text-gray-400">User</p>
                <p className="font-mono text-lg font-bold text-base-content">{customer.username}</p>
            </div>
            <div className="bg-base-100 p-3 rounded-md">
                <p className="text-sm text-gray-400">Total Orders</p>
                <p className="text-lg font-bold text-base-content">{totalOrders}</p>
            </div>
            <div className="bg-base-100 p-3 rounded-md">
                <p className="text-sm text-gray-400">Lifetime Spending</p>
                <p className="text-lg font-bold text-primary">${totalSpent.toFixed(2)}</p>
            </div>
        </div>
      </div>


      <h3 className="text-xl font-semibold text-base-content mb-4 border-b border-base-300 pb-2">Completed Orders</h3>
      {orders.length === 0 ? (
        <p className="text-center text-gray-400 py-8">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-base-300 p-4 rounded-lg">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                <div>
                  <p className="font-semibold text-base-content">Order #{order.id.slice(-6)}</p>
                  <p className="text-xs text-gray-400">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-primary">${order.total.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{order.items.length} item(s)</p>
                </div>
              </div>
              {expandedOrderId === order.id && (
                <div className="mt-4 pt-4 border-t border-base-100 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-300">Order Details</h4>
                  {order.items.map(item => {
                    const price = item.onSale ? item.salePrice! : item.price;
                    const displayImage = item.imageUrl !== 'error' && item.imageUrl !== 'loading' ? item.imageUrl : undefined;
                    return (
                      <div key={item.id} className="flex items-center text-sm">
                        <img src={displayImage} alt={item.name} className="w-12 h-12 rounded object-cover mr-3 bg-base-100"/>
                        <div className="flex-grow">
                            <span className="font-semibold text-base-content truncate" title={item.name}>{item.name}</span>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>{item.quantity} @ ${price.toFixed(2)}</span>
                                {item.onSale && <span className="text-xs font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">SALE</span>}
                            </div>
                        </div>
                        <span className="w-20 text-right font-semibold">${(price * item.quantity).toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountView;