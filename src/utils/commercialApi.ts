/**
 * Commercial Backend API Client
 *
 * Provides bridge to server-side commercial microservice:
 * - Probes server health status
 * - Creates official Stripe Checkout Sessions
 * - Reports offline/unready state without implying a successful payment
 */

export interface BackendHealthStatus {
  isOnline: boolean;
  stripeConfigured: boolean;
  paypalConfigured: boolean;
  paypalMode?: string;
}

let cachedHealth: BackendHealthStatus | null = null;
let lastProbeTime = 0;

/**
 * Checks if the Node.js commercial backend service is running on /api
 */
export async function probeBackendHealth(): Promise<BackendHealthStatus> {
  const now = Date.now();
  // Cache probe result for 10 seconds to avoid excessive network traffic
  if (cachedHealth && now - lastProbeTime < 10000) {
    return cachedHealth;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);
  try {
    const res = await fetch('/api/health', {
      method: 'GET',
      signal: controller.signal,
    });

    if (res.ok) {
      const data = await res.json();
      cachedHealth = {
        isOnline: true,
        stripeConfigured: Boolean(data.gateways?.stripeConfigured),
        paypalConfigured: Boolean(data.gateways?.paypalConfigured),
        paypalMode: data.gateways?.paypalMode,
      };
      lastProbeTime = now;
      return cachedHealth;
    }
  } catch {
    // Connectivity probe only: callers must not grant payment rights on failure.
  } finally {
    clearTimeout(timer);
  }

  cachedHealth = {
    isOnline: false,
    stripeConfigured: false,
    paypalConfigured: false,
  };
  lastProbeTime = now;
  return cachedHealth;
}

/**
 * Requests official Stripe Checkout session from backend
 */
export async function createServerStripeCheckout(params: {
  plan: 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  userEmail?: string;
}): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
  try {
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (res.ok && data.checkoutUrl) {
      return { success: true, checkoutUrl: data.checkoutUrl };
    }
    return { success: false, error: data.error || 'Failed to create Stripe checkout session' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error reaching payment server',
    };
  }
}
