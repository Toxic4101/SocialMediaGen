import React, { useState } from 'react';
import { Product, SocialMediaPost, Payout, Customer } from '../types';
import { Icon } from './Icon';
import { useActivityLog } from '../hooks/useActivityLog';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  drafts: Partial<Product>[];
  onPublish: (draftId: string) => void;
  onReject: (draftId: string) => void;
  dailyRevenue: number;
  dailyCosts: number;
  bankBalance: number;
  payoutHistory: Payout[];
  onPayout: () => void;
  socialMediaPosts: SocialMediaPost[];
  isAiOnCooldown: boolean;
  onGenerateDrafts: () => void;
  customer: Customer;
  currentAiTask: string | null;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen, onClose, products, drafts, onPublish, onReject, dailyRevenue, dailyCosts, bankBalance, payoutHistory, onPayout, socialMediaPosts,
  isAiOnCooldown, onGenerateDrafts, customer, currentAiTask
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isOpen) return null;
  
  const dailyProfit = dailyRevenue - dailyCosts;
  
  const TABS = [
      { id: 'dashboard', label: 'Dashboard', icon: 'chart-bar' },
      { id: 'drafts', label: 'Drafts', icon: 'document-text' },
      { id: 'financials', label: 'Financials', icon: 'dollar' },
      { id: 'marketing', label: 'Marketing', icon: 'megaphone' },
      { id: 'controls', label: 'Controls', icon: 'gear' },
  ];
  
  const ActivityLog = () => {
    const { logs } = useActivityLog();
    return (
      <div className="bg-base-300 p-4 rounded-lg flex-grow overflow-hidden flex flex-col">
        <h3 className="font-semibold mb-3 text-base-content text-sm">Activity Log</h3>
        <div className="flex-grow overflow-y-auto pr-2 font-mono text-xs space-y-1">
          {logs.map(log => (
            <div key={log.id} className={`flex ${
                log.type === 'SUCCESS' ? 'text-green-400' :
                log.type === 'ERROR' ? 'text-red-400' :
                log.type === 'SYSTEM' ? 'text-cyan-400' : 'text-gray-400'
            }`}>
              <span className="w-16 flex-shrink-0">{log.timestamp}</span>
              <span className="w-16 font-bold flex-shrink-0">[{log.type}]</span>
              <span className="whitespace-pre-wrap break-words">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderProductPerformance = () => {
    const publishedProducts = products.filter(p => p.status === 'published');
    
    return (
         <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {publishedProducts.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No published products yet.</p>}
            {publishedProducts.map(p => {
                 const sales = customer.orderHistory.flatMap(o => o.items).filter(i => i.id === p.id).reduce((sum, i) => sum + i.quantity, 0);
                 const revenue = sales * (p.onSale && p.salePrice ? p.salePrice : p.price);
                 return (
                     <div key={p.id} className="bg-base-300 p-3 rounded-md text-xs">
                        <p className="font-semibold truncate mb-2">{p.name}</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div><p className="text-gray-400">Views</p><p className="font-bold text-lg">{p.views}</p></div>
                            <div><p className="text-gray-400">Sales</p><p className="font-bold text-lg">{sales}</p></div>
                            <div><p className="text-gray-400">Revenue</p><p className="font-bold text-lg text-green-400">${revenue.toFixed(2)}</p></div>
                        </div>
                     </div>
                 );
            })}
         </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-base-200 rounded-lg shadow-2xl p-6 w-full max-w-6xl flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-primary mb-4">Admin Control Panel</h2>
        
        <div className="flex border-b border-base-300 mb-4 flex-wrap">
            {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors flex-shrink-0 relative ${activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-primary'}`} title={tab.label}>
                <Icon name={tab.icon as any} className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'drafts' && drafts.length > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{drafts.length}</span>
                )}
            </button>
            ))}
        </div>
        
        <div className="flex-grow flex gap-6 overflow-hidden">
            <div className="w-1/2 flex flex-col gap-4">
                <ActivityLog />
            </div>
            <div className="w-1/2 flex flex-col gap-4 overflow-y-auto pr-2">
                {activeTab === 'dashboard' && (
                  <div className="space-y-4">
                     <h3 className="font-semibold text-base-content text-sm mb-2" id="today-performance-header">Today's Performance</h3>
                      <div className="grid grid-cols-3 gap-4">
                          <div className="bg-base-300 p-4 rounded-lg text-center"><p className="text-xs text-gray-400">Revenue</p><p className="text-2xl font-bold text-green-400">${dailyRevenue.toFixed(2)}</p></div>
                          <div className="bg-base-300 p-4 rounded-lg text-center"><p className="text-xs text-gray-400">Costs</p><p className="text-2xl font-bold text-red-400">${dailyCosts.toFixed(2)}</p></div>
                          <div id="net-profit-card" className="bg-base-300 p-4 rounded-lg text-center"><p className="text-xs text-gray-400">Profit</p><p className={`text-2xl font-bold ${dailyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>${dailyProfit.toFixed(2)}</p></div>
                      </div>
                     <h3 className="font-semibold text-base-content text-sm pt-4 mb-2">Product Performance Analysis</h3>
                     {renderProductPerformance()}
                  </div>
                )}
                 {activeTab === 'drafts' && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-base-content text-sm">Product Drafts</h3>
                        <div className="bg-base-300 p-3 rounded-lg max-h-[70vh] overflow-y-auto space-y-3">
                           {drafts.length === 0 ? <p className="text-xs text-gray-500 text-center py-4">No drafts. Use the Controls tab to generate new ones.</p> : drafts.map(draft => (
                               <div key={draft.id} className="p-3 bg-base-100 rounded-lg text-xs">
                                   <p className="font-bold text-base-content mb-1">{draft.name}</p>
                                   <p className="text-gray-400 mb-3">{draft.description}</p>
                                   <div className="flex justify-end gap-2">
                                       <button onClick={() => onReject(draft.id!)} className="px-3 py-1 bg-red-800/50 text-red-300 rounded-md hover:bg-red-800/80 text-xs">Reject</button>
                                       <button onClick={() => onPublish(draft.id!)} disabled={!!currentAiTask} className="px-3 py-1 bg-green-800/50 text-green-300 rounded-md hover:bg-green-800/80 text-xs font-bold disabled:bg-gray-600 disabled:cursor-not-allowed">Publish</button>
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                 )}
                 {activeTab === 'financials' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                                <Icon name="dollar" className="w-5 h-5 text-primary" />
                                <span>PayFast Business Account</span>
                            </h3>
                            <div className="bg-base-300 p-4 rounded-lg">
                                 {dailyProfit >= 0 ? (
                                    <>
                                        <p className="text-xs text-gray-400">Available Balance</p>
                                        <p className="text-3xl font-bold text-green-400">${dailyProfit.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500 mt-1">This is your current net profit (Revenue - Costs).</p>
                                        <button onClick={onPayout} disabled={dailyProfit <= 0} className="mt-4 w-full bg-primary text-primary-content font-bold py-2 rounded-md hover:bg-primary-focus disabled:bg-gray-600 disabled:cursor-not-allowed">Payout to Bank</button>
                                    </>
                                 ) : (
                                     <>
                                        <p className="text-xs text-gray-400">Today's Net Loss</p>
                                        <p className="text-3xl font-bold text-red-400">${Math.abs(dailyProfit).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500 mt-1">Payouts are unavailable when there is a net loss.</p>
                                        <button disabled className="mt-4 w-full bg-gray-600 text-primary-content font-bold py-2 rounded-md cursor-not-allowed">Payout to Bank</button>
                                     </>
                                 )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                                <Icon name="bank" className="w-5 h-5 text-primary" />
                                <span>Linked Bank Account</span>
                            </h3>
                             <div className="bg-base-300 p-4 rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-400">Current Balance</p>
                                    <p className="font-mono text-xl font-bold text-primary-content">${bankBalance.toFixed(2)}</p>
                                </div>
                                 <div className="border-t border-base-100 pt-3">
                                     <h4 className="text-xs font-semibold text-gray-400 mb-2">Payout History</h4>
                                     <div className="space-y-2 text-xs max-h-40 overflow-y-auto pr-2">
                                        {payoutHistory.length === 0 ? <p className="text-gray-500 text-center">No payouts yet.</p> : payoutHistory.map(p => (
                                            <div key={p.id} className="flex justify-between items-center bg-base-100 p-2 rounded-md">
                                                <span className="text-gray-300">Payout on {p.date}</span>
                                                <span className="font-semibold text-green-400">+${p.amount.toFixed(2)}</span>
                                            </div>
                                        ))}
                                     </div>
                                 </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'marketing' && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-300 mb-2">Social Media Feed</h3>
                         <div className="bg-base-300 p-3 rounded-lg max-h-[70vh] overflow-y-auto space-y-3">
                           {socialMediaPosts.length === 0 ? <p className="text-xs text-gray-500 text-center">No posts yet.</p> : socialMediaPosts.map(post => (
                               <div key={post.id} className="p-3 bg-base-100 rounded-lg text-xs">
                                   <p className="font-semibold text-gray-300 mb-1">{post.type} Post <span className="text-gray-500 font-normal">- {post.timestamp}</span></p>
                                   <p className="text-base-content whitespace-pre-wrap">{post.content}</p>
                               </div>
                           ))}
                        </div>
                    </div>
                )}
                 {activeTab === 'controls' && (
                     <div className="space-y-6">
                         <div>
                            <h3 className="text-sm font-bold text-gray-300 mb-2">AI Co-pilot Controls</h3>
                             <div className="bg-base-300 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-400">Current AI Status</p>
                                    <p className={`font-mono text-xs font-bold px-2 py-1 rounded ${currentAiTask ? 'bg-yellow-400/20 text-yellow-300 animate-pulse' : 'bg-green-400/20 text-green-300'}`}>
                                        {currentAiTask ? 'Busy' : 'Idle'}
                                    </p>
                                </div>
                                 {currentAiTask && <p className="text-xs text-gray-500 mt-2 text-center break-words">{currentAiTask}</p>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-300 mb-2">Manual Actions</h3>
                            <div className="space-y-2">
                                <button onClick={onGenerateDrafts} disabled={isAiOnCooldown || !!currentAiTask} title={isAiOnCooldown ? "AI is on cooldown." : "Generate new product concepts."} className="w-full text-left p-3 bg-base-300 rounded-md hover:bg-primary/20 disabled:bg-base-300/50 disabled:cursor-not-allowed flex items-center gap-3">
                                    <Icon name="bolt" className="w-5 h-5 text-primary" />
                                    <span>Generate New Product Drafts</span>
                                </button>
                            </div>
                        </div>
                     </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;