export type StylePresetId =
  | 'cyberpunk'
  | 'nature'
  | 'interior'
  | 'fantasy'
  | 'space'
  | 'anime'
  | 'custom';

export interface StylePreset {
  id: StylePresetId;
  name: string;
  description: string;
  promptSuffix: string;
  previewColor: string;
}

export type ResolutionTier = '1K' | '2K' | '4K';

export interface ResolutionConfig {
  label: ResolutionTier;
  width: number;
  height: number;
  credits: number;
}

export interface PanoramaAsset {
  id: string;
  title: string;
  prompt: string;
  style: StylePresetId;
  resolution: ResolutionTier;
  dataUrl: string; // 2:1 equirectangular data URL
  createdAt: number;
  isSeamCorrected: boolean;
}

export type ViewerProjectionMode = 'sphere' | 'curved' | 'little-planet' | 'vr-cardboard';

export interface PanoramaHotspot {
  id: string;
  lon: number; // -180 to 180 degrees
  lat: number; // -90 to 90 degrees
  title: string;
  description: string;
  color?: string;
}

export type CubemapFaceName = 'posx' | 'negx' | 'posy' | 'negy' | 'posz' | 'negz';

export interface CubemapFace {
  name: CubemapFaceName;
  label: string; // e.g. Right (+X), Left (-X), Top (+Y), Bottom (-Y), Front (+Z), Back (-Z)
  dataUrl: string;
  canvas: HTMLCanvasElement;
}

export type ActiveTab = 'generator' | 'viewer' | 'cubemap' | 'globe' | 'pricing' | 'admin';

export interface ModelEndpointConfig {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'fal' | 'replicate' | 'custom';
  baseUrl: string;
  apiKey: string;
  model: string;
  isEnabled: boolean;
  priority: number;
  maxResolution: string;
  isDefault: boolean;
}

export type UserPlanTier = 'free' | 'pro' | 'enterprise';

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  plan: UserPlanTier;
  creditsBalance: number;
  creditsTotal: number;
  status: 'active' | 'suspended' | 'cancelled';
  joinedAt: string;
  lastActiveAt: string;
  apiCallsCount: number;
}

export interface SystemBillingConfig {
  freeMonthlyCredits: number;
  proMonthlyPriceUsd: number;
  proMonthlyCredits: number;
  enterpriseCustomPricing: boolean;
  creditCostPer1K: number;
  creditCostPer2K: number;
  creditCostPer4K: number;
}
