import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import CartView from './components/CartView';
import ConfirmationView from './components/ConfirmationView';
import { Product, CartItem, AppView, Customer, Order, SocialMediaPost, EmailCampaign, Payout, RecommendedProduct } from './types';
import * as geminiService from './services/geminiService';
import { QuotaExceededError, ModelUnavailableError, InvalidRequestError, AiServerError } from './services/geminiService';
import AdminPanel from './components/AdminPanel';
import AboutModal from './components/AboutModal';
import InitializationScreen from './components/InitializationScreen';
import AccountView from './components/AccountView';
import Chatbot from './components/Chatbot';
import ApiKeyError from './components/ApiKeyError';
import RecommendationEngine from './components/RecommendationEngine';
import PayFastGatewayView from './components/PayFastGatewayView';
import { useActivityLog } from './hooks/useActivityLog';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type AppState = 'INIT' | 'CHECKING_KEY' | 'API_KEY_ERROR' | 'READY';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('INIT');
    const [view, setView] = useState<AppView>(AppView.STORE);

    // Core Business State
    const [products, setProducts] = useState<Product[]>([]);
    const [drafts, setDrafts] = useState<Partial<Product>[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [customer, setCustomer] = useState<Customer>({ username: 'Guest', orderHistory: [] });
    const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>([]);
    const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
    const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
    const [sessionViewedProductIds, setSessionViewedProductIds] = useState<Set<string>>(new Set());

    // Financial State
    const [dailyRevenue, setDailyRevenue] = useState(0);
    const [dailyCosts, setDailyCosts] = useState(0);
    const [bankBalance, setBankBalance] = useState(150.00);
    const [payoutHistory, setPayoutHistory] = useState<Payout[]>([]);

    // UI State
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [selectedProductForChat, setSelectedProductForChat] = useState<Product | null>(null);
    const [checkoutTotal, setCheckoutTotal] = useState(0);
    
    // AI Control State
    const [isAiOnCooldown, setIsAiOnCooldown] = useState(false);
    const [currentAiTask, setCurrentAiTask] = useState<string | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    
    const { addLog } = useActivityLog();

    const checkApiKey = () => {
        try {
            return !!process.env.API_KEY;
        } catch (e) {
            return false;
        }
    };

    const initializeApp = () => {
        setAppState('CHECKING_KEY');
        if (!checkApiKey()) {
            setAppState('API_KEY_ERROR');
            return;
        }
        setAppState('READY');
        addLog("Cortex Commerce Initialized. AI Co-pilot is online.", 'SYSTEM');
    };

    // --- Central AI Error Handler ---
    const handleAiError = useCallback((error: Error) => {
        let advice = "The AI encountered an unexpected issue.";
        if (error instanceof QuotaExceededError) {
            advice = `ADVICE: You've hit your API quota. All AI generation will be halted for 60s. Check your Google AI Studio plan and billing.`;
            setIsAiOnCooldown(true);
            setTimeout(() => {
                setIsAiOnCooldown(false);
                addLog('AI cooldown finished.', 'SYSTEM');
            }, 60_000);
        } else if (error instanceof ModelUnavailableError) {
            advice = "ADVICE: The AI model is currently overloaded or unavailable. This is usually temporary. Please try again in a few moments.";
        } else if (error instanceof InvalidRequestError) {
            advice = "ADVICE: The application sent an invalid request to the AI. This may be a bug. Try a different action.";
        } else if (error instanceof AiServerError) {
            advice = "ADVICE: The AI service is experiencing internal issues. This is likely temporary. Please try again later.";
        }
        addLog(`${error.name}: ${error.message}\n${advice}`, 'ERROR');
        setGenerationError(error.message);
    }, [addLog]);

    // --- AI Co-pilot Workflow ---
    const handleGenerateDrafts = useCallback(async () => {
        if (currentAiTask || isAiOnCooldown) return;
        setCurrentAiTask("Generating new product drafts...");
        setGenerationError(null);
        addLog("AI is generating new product drafts...", 'INFO');
        try {
            const existingNames = products.map(p => p.name);
            const newDrafts = await geminiService.generateProductDrafts(existingNames);
            const draftsWithIds = newDrafts.map(d => ({ ...d, id: `draft_${Date.now()}_${Math.random()}` }));
            setDrafts(prev => [...draftsWithIds, ...prev]);
            addLog(`AI generated ${newDrafts.length} new drafts for your review.`, 'SUCCESS');
        } catch (error) {
            handleAiError(error as Error);
        } finally {
            setCurrentAiTask(null);
        }
    }, [products, currentAiTask, isAiOnCooldown, handleAiError, addLog]);

    const handlePublishProduct = useCallback(async (draftId: string) => {
        const draft = drafts.find(d => d.id === draftId);
        if (!draft || !draft.name || !draft.description) return;
        
        if (currentAiTask) {
            addLog("AI is busy with another task. Please wait.", "ERROR");
            return;
        }
        setCurrentAiTask(`Publishing "${draft.name}"...`);

        addLog(`Publishing draft: "${draft.name}"...`, 'INFO');
        setDrafts(prev => prev.filter(d => d.id !== draftId));
        
        let newProduct: Product = {
            id: `prod_${Date.now()}`,
            name: draft.name,
            description: draft.description,
            price: 0,
            imageUrl: 'loading',
            status: 'published',
            views: 0,
            performanceScore: 0.5,
            onSale: false,
            adSpend: 0,
            referredSales: 0,
        };
        setProducts(prev => [newProduct, ...prev]);

        try {
            setCurrentAiTask(`Enriching details for "${newProduct.name}"...`);
            addLog(`Enriching details for "${newProduct.name}"...`, 'INFO');
            setDailyCosts(prev => prev + 0.01);
            const enrichedDetails = await geminiService.enrichProductDetails(draft);
            newProduct = { ...newProduct, ...enrichedDetails };
            setProducts(prev => prev.map(p => p.id === newProduct.id ? newProduct : p));
            await sleep(1000);

            setCurrentAiTask(`Generating image for "${newProduct.name}"...`);
            addLog(`Generating image for "${newProduct.name}"...`, 'INFO');
            setDailyCosts(prev => prev + 0.02);
            const imageData = await geminiService.generateProductImage(newProduct.imagePrompt!);
            newProduct.imageUrl = `data:image/jpeg;base64,${imageData}`;
            setProducts(prev => prev.map(p => p.id === newProduct.id ? newProduct : p));
            await sleep(1000);

            setCurrentAiTask(`Generating social media post for "${newProduct.name}"...`);
            addLog(`Generating social media post for "${newProduct.name}"...`, 'INFO');
            setDailyCosts(prev => prev + 0.005);
            const postContent = await geminiService.generateSocialMediaPost(newProduct);
            setSocialMediaPosts(prev => [{
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                type: 'New Product',
                content: postContent,
            }, ...prev]);

            addLog(`Product "${newProduct.name}" published successfully!`, 'SUCCESS');

        } catch (error) {
            handleAiError(error as Error);
            setProducts(prev => prev.map(p => p.id === newProduct.id ? { ...p, imageUrl: 'error', imageError: (error as Error).message } : p));
        } finally {
            setCurrentAiTask(null);
        }
    }, [drafts, currentAiTask, handleAiError, addLog]);

    const handleRejectProduct = (draftId: string) => {
        const draft = drafts.find(d => d.id === draftId);
        if (draft) {
            setDrafts(prev => prev.filter(d => d.id !== draftId));
            addLog(`Draft "${draft.name || 'Untitled'}" rejected.`, 'INFO');
        }
    };
    
    // --- Cart and Checkout ---
    const handleAddToCart = (product: Product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        addLog(`Added "${product.name}" to cart.`, 'INFO');
    };

    const handleRemoveFromCart = (productId: string) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));
    };

    const handleCheckout = (total: number, items: CartItem[]) => {
        addLog(`Proceeding to checkout with ${items.length} items for a total of $${total.toFixed(2)}.`, 'SYSTEM');
        setCheckoutTotal(total);
        setView(AppView.PAYMENT_GATEWAY);
    };

    const handleConfirmPayment = () => {
        const newOrder: Order = {
            id: `ord_${Date.now()}`,
            date: new Date().toLocaleString(),
            items: cartItems,
            total: checkoutTotal,
        };
        setCustomer(prev => ({ ...prev, orderHistory: [newOrder, ...prev.orderHistory] }));
        setDailyRevenue(prev => prev + checkoutTotal);
        setCartItems([]);
        setView(AppView.CONFIRMATION);
        addLog(`Order #${newOrder.id.slice(-6)} confirmed for $${checkoutTotal.toFixed(2)}.`, 'SUCCESS');
    };
    
    const handlePayout = () => {
        const profit = dailyRevenue - dailyCosts;
        if (profit <= 0) return;
        
        const newPayout: Payout = {
            id: `payout_${Date.now()}`,
            date: new Date().toLocaleDateString(),
            amount: profit,
        };
        
        setBankBalance(prev => prev + profit);
        setPayoutHistory(prev => [newPayout, ...prev]);
        setDailyRevenue(0);
        setDailyCosts(0);
        addLog(`Successfully paid out $${profit.toFixed(2)} to bank.`, 'SUCCESS');
    };

    const handleProductView = useCallback((productId: string) => {
        setSessionViewedProductIds(currentViewedIds => {
            if (currentViewedIds.has(productId)) {
                return currentViewedIds;
            }
            setProducts(allProducts => allProducts.map(p => 
                p.id === productId ? { ...p, views: p.views + 1, performanceScore: Math.min(1, p.performanceScore + 0.001) } : p
            ));
            const newSet = new Set(currentViewedIds);
            newSet.add(productId);
            return newSet;
        });
    }, []);
    
     // --- Recommendation Engine ---
    useEffect(() => {
        const publishedProducts = products.filter(p => p.status === 'published');
        if (publishedProducts.length < 1) {
            setRecommendedProducts([]);
            return;
        }

        const productSales = publishedProducts.map(p => {
            const sales = customer.orderHistory
                .flatMap(o => o.items)
                .filter(i => i.id === p.id)
                .reduce((sum, i) => sum + i.quantity, 0);
            const revenue = sales * (p.onSale && p.salePrice ? p.salePrice : p.price);
            return { ...p, totalRevenue: revenue };
        });

        const topSellers = productSales
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 2)
            .filter(p => p.totalRevenue > 0);

        if (topSellers.length > 0) {
            const recommended: RecommendedProduct[] = topSellers.map(p => ({
                ...p,
                recommendationReason: "A consistent top-performer in our store.",
                recommendationType: 'TOP_SELLER',
            }));
            setRecommendedProducts(recommended);
        } else {
             const topPerformers = [...publishedProducts]
                .sort((a, b) => b.performanceScore - a.performanceScore)
                .slice(0, 1);
             const recommended: RecommendedProduct[] = topPerformers.map(p => ({
                ...p,
                recommendationReason: "Trending now based on customer interest.",
                recommendationType: 'TRENDING',
            }));
            setRecommendedProducts(recommended);
        }
    }, [products, customer.orderHistory]);


    if (appState === 'API_KEY_ERROR') return <ApiKeyError />;
    if (appState !== 'READY') return <InitializationScreen onInitialize={initializeApp} />;
    
    const currentView = () => {
        switch(view) {
            case AppView.STORE:
                return (
                    <>
                        <RecommendationEngine 
                            products={recommendedProducts} 
                            onAddToCart={handleAddToCart}
                            onAskAi={(p) => { setSelectedProductForChat(p); setIsChatbotOpen(true); }}
                            onProductView={handleProductView}
                            isAiOnCooldown={isAiOnCooldown} 
                        />
                        <ProductList 
                            products={products}
                            onAddToCart={handleAddToCart}
                            onAskAi={(p) => { setSelectedProductForChat(p); setIsChatbotOpen(true); }}
                            onProductView={handleProductView}
                            isAiOnCooldown={isAiOnCooldown}
                        />
                    </>
                );
            case AppView.CART:
                return <CartView cartItems={cartItems} onRemoveFromCart={handleRemoveFromCart} onCheckout={handleCheckout} setView={setView} />;
            case AppView.CONFIRMATION:
                return <ConfirmationView setView={setView} />;
            case AppView.PAYMENT_GATEWAY:
                return <PayFastGatewayView onConfirmPayment={handleConfirmPayment} onCancelPayment={() => setView(AppView.CART)} cartTotal={checkoutTotal} />;
            case AppView.ORDER_HISTORY:
                return <AccountView orders={customer.orderHistory} setView={setView} customer={customer} />;
            default:
                return <div>Unknown View</div>;
        }
    };

    return (
        <div className="min-h-screen bg-base-100 font-sans">
            <Header 
                cartItemCount={cartItems.reduce((count, item) => count + item.quantity, 0)} 
                setView={setView} 
                onAdminClick={() => setIsAdminPanelOpen(true)} 
                onInfoClick={() => setIsAboutModalOpen(true)}
                isAiOnCooldown={isAiOnCooldown}
            />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {currentView()}
            </main>
            <AdminPanel 
                isOpen={isAdminPanelOpen}
                onClose={() => setIsAdminPanelOpen(false)}
                products={products}
                dailyRevenue={dailyRevenue}
                dailyCosts={dailyCosts}
                bankBalance={bankBalance}
                payoutHistory={payoutHistory}
                onPayout={handlePayout}
                socialMediaPosts={socialMediaPosts}
                isAiOnCooldown={isAiOnCooldown}
                onGenerateDrafts={handleGenerateDrafts}
                drafts={drafts}
                onPublish={handlePublishProduct}
                onReject={handleRejectProduct}
                customer={customer}
                currentAiTask={currentAiTask}
            />
             <AboutModal
                isOpen={isAboutModalOpen}
                onClose={() => setIsAboutModalOpen(false)}
            />
            {isChatbotOpen && selectedProductForChat && (
                <Chatbot
                    isOpen={isChatbotOpen}
                    onClose={() => setIsChatbotOpen(false)}
                    product={selectedProductForChat}
                    onAiError={handleAiError}
                    isAiOnCooldown={isAiOnCooldown}
                />
            )}
        </div>
    );
};

export default App;