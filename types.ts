export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imagePrompt?: string;
  imageUrl: string | 'error' | 'loading';
  imageError?: string;
  reviews?: Review[];
  details?: string[];
  usageInstructions?: string[];
  status: 'published' | 'draft';
  // For A/B testing
  views: number;
  performanceScore: number;
  adSpend: number;
  referredSales: number;
  // For Marketing Campaigns
  onSale: boolean;
  discountPercentage?: number;
  salePrice?: number;
  marketingSlogan?: string;
}

export interface RecommendedProduct extends Product {
    recommendationReason: string;
    recommendationType: 'TOP_SELLER' | 'TRENDING' | 'SPECIAL_OFFER' | 'PERSONALIZED';
}

export interface Review {
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
}

export interface ChatMessage {
    sender: 'USER' | 'AI';
    text: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum AppView {
  STORE = 'STORE',
  CART = 'CART',
  CONFIRMATION = 'CONFIRMATION',
  ORDER_HISTORY = 'ORDER_HISTORY',
  PAYMENT_GATEWAY = 'PAYMENT_GATEWAY',
}

export type LogType = 'INFO' | 'SUCCESS' | 'ERROR' | 'SYSTEM';

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: LogType;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
}

export interface Customer {
  orderHistory: Order[];
  username: string;
}

export interface SocialMediaPost {
    id: number;
    timestamp: string;
    content: string;
    type: 'New Product' | 'Promotion' | 'Engagement';
    adImageUrl?: string | 'loading' | 'error';
    adImageError?: string;
    imagePrompt?: string;
}

export interface EmailCampaign {
    id: number;
    timestamp: string;
    subject: string;
    body: string;
    campaignType: 'Welcome' | 'Promotion';
}

export interface Payout {
    id:string;
    date: string;
    amount: number;
}
