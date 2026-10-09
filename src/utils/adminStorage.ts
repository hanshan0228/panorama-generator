import type { ModelEndpointConfig, ManagedUser, SystemBillingConfig } from '../types/panorama';

const MODELS_STORAGE_KEY = 'panorama_admin_models_config';
const USERS_STORAGE_KEY = 'panorama_admin_users_config';
const BILLING_STORAGE_KEY = 'panorama_admin_billing_config';

export const DEFAULT_MODEL_ENDPOINTS: ModelEndpointConfig[] = [
  {
    id: 'gemini-imagen3',
    name: 'Gemini Imagen 3.0 (Local Proxy / Official)',
    provider: 'gemini',
    baseUrl: 'http://localhost:8317',
    apiKey: '',
    model: 'gpt-image-2.5',
    isEnabled: true,
    priority: 1,
    maxResolution: '4K',
    isDefault: true,
  },
  {
    id: 'gemini-flash-img',
    name: 'Gemini 2.5 Flash Image (Fast & Lightweight)',
    provider: 'gemini',
    baseUrl: 'http://localhost:8317',
    apiKey: '',
    model: 'gpt-image-2',
    isEnabled: true,
    priority: 2,
    maxResolution: '2K',
    isDefault: false,
  },
  {
    id: 'fal-flux-schnell',
    name: 'Flux.1 Schnell (Fal.ai Serverless)',
    provider: 'fal',
    baseUrl: 'https://fal.run/fal-ai/flux/schnell',
    apiKey: '',
    model: 'flux-schnell',
    isEnabled: false,
    priority: 3,
    maxResolution: '4K',
    isDefault: false,
  },
  {
    id: 'openai-dalle3',
    name: 'DALL-E 3 (OpenAI Standard)',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'dall-e-3',
    isEnabled: false,
    priority: 4,
    maxResolution: '2K',
    isDefault: false,
  },
];

export const DEFAULT_MANAGED_USERS: ManagedUser[] = [
  {
    id: 'usr_8801',
    email: 'creator.alex@studio360.io',
    name: 'Alex Vance',
    plan: 'pro',
    creditsBalance: 860,
    creditsTotal: 1000,
    status: 'active',
    joinedAt: '2026-03-12',
    lastActiveAt: '10 mins ago',
    apiCallsCount: 140,
  },
  {
    id: 'usr_8802',
    email: 'vr.developer@metaverse.com',
    name: 'Chen Lin',
    plan: 'enterprise',
    creditsBalance: 4620,
    creditsTotal: 5000,
    status: 'active',
    joinedAt: '2026-01-05',
    lastActiveAt: '2 hours ago',
    apiCallsCount: 885,
  },
  {
    id: 'usr_8803',
    email: 'sarah.design@archviz.org',
    name: 'Sarah Connor',
    plan: 'pro',
    creditsBalance: 320,
    creditsTotal: 1000,
    status: 'active',
    joinedAt: '2026-02-18',
    lastActiveAt: 'Yesterday',
    apiCallsCount: 220,
  },
  {
    id: 'usr_8804',
    email: 'guest9203@gmail.com',
    name: 'Mike Ross',
    plan: 'free',
    creditsBalance: 5,
    creditsTotal: 50,
    status: 'active',
    joinedAt: '2026-04-01',
    lastActiveAt: '3 days ago',
    apiCallsCount: 18,
  },
  {
    id: 'usr_8805',
    email: 'spam.crawler@botnet.xyz',
    name: 'Abusive Bot',
    plan: 'free',
    creditsBalance: 0,
    creditsTotal: 50,
    status: 'suspended',
    joinedAt: '2026-03-29',
    lastActiveAt: '1 week ago',
    apiCallsCount: 300,
  },
];

export const DEFAULT_BILLING_CONFIG: SystemBillingConfig = {
  freeMonthlyCredits: 50,
  proMonthlyPriceUsd: 19,
  proMonthlyCredits: 1000,
  enterpriseCustomPricing: true,
  creditCostPer1K: 1,
  creditCostPer2K: 2,
  creditCostPer4K: 4,
};

export function getStoredModelEndpoints(): ModelEndpointConfig[] {
  try {
    const raw = localStorage.getItem(MODELS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_MODEL_ENDPOINTS;
}

export function saveStoredModelEndpoints(endpoints: ModelEndpointConfig[]): void {
  try {
    localStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(endpoints));
  } catch {
    // fallback
  }
}

export function getStoredManagedUsers(): ManagedUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_MANAGED_USERS;
}

export function saveStoredManagedUsers(users: ManagedUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // fallback
  }
}

export function getStoredBillingConfig(): SystemBillingConfig {
  try {
    const raw = localStorage.getItem(BILLING_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_BILLING_CONFIG;
}

export function saveStoredBillingConfig(config: SystemBillingConfig): void {
  try {
    localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // fallback
  }
}
