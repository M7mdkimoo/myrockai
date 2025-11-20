
export enum UserRole {
  USER = 'USER',
  EXPERT = 'EXPERT' // 'Rock'
}

export enum ServiceCategory {
  DESIGN = 'Design',
  VIDEO = 'Video',
  PROGRAMMING = 'Programming',
  TEXT = 'Text',
  ANALYSIS = 'Analysis',
  WEB_DATA = 'Web & Data',
  MODELING_3D = '3D Modeling'
}

// Industry standard hourly rates (USD) - Adjusted for competitive market entry
export const SERVICE_RATES: Record<ServiceCategory, number> = {
  [ServiceCategory.PROGRAMMING]: 50,
  [ServiceCategory.MODELING_3D]: 50,
  [ServiceCategory.WEB_DATA]: 45,
  [ServiceCategory.ANALYSIS]: 45,
  [ServiceCategory.VIDEO]: 40,
  [ServiceCategory.DESIGN]: 30,
  [ServiceCategory.TEXT]: 15,
};

export type ApiProvider = 'google' | 'openai' | 'anthropic' | 'mistral' | 'cohere';

export interface ApiKeys {
  [key: string]: string;
}

export interface UserPreferences {
  thinkingMode: boolean;
  defaultAspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  role: UserRole;
  avatarUrl?: string;
  ratings: number[];
  preferences?: UserPreferences;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'rock';
  text: string;
  timestamp: number;
  attachments?: FileAttachment[];
  groundingMetadata?: any;
  generatedMedia?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    mimeType: string;
  };
}

export interface FileAttachment {
  name: string;
  type: string;
  data: string; // Base64
}

export interface PoolRequest {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  files: FileAttachment[];
  aiEstimate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: number;
  bids: ExpertBid[];
}

export interface ExpertBid {
  expertId: string;
  expertName: string;
  price: number;
  deliveryTime: string;
}

// Toast Notification Types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
