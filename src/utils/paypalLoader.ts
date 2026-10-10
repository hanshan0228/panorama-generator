interface PayPalScriptOptions {
  clientId: string;
  currency?: string;
  vault?: boolean;
  intent?: 'subscription' | 'capture';
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: {
          shape?: 'pill' | 'rect';
          color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
          layout?: 'vertical' | 'horizontal';
          label?: 'subscribe' | 'paypal' | 'checkout' | 'buynow';
          size?: 'medium' | 'large' | 'responsive';
        };
        createSubscription?: (
          data: Record<string, unknown>,
          actions: {
            subscription: {
              create: (options: { plan_id: string }) => Promise<string>;
            };
          }
        ) => Promise<string>;
        onApprove?: (
          data: { subscriptionID?: string; orderID?: string },
          actions: Record<string, unknown>
        ) => Promise<void> | void;
        onError?: (err: unknown) => void;
        onCancel?: (data: Record<string, unknown>) => void;
      }) => {
        render: (containerOrSelector: HTMLElement | string) => Promise<void>;
      };
    };
  }
}

let paypalLoadingPromise: Promise<boolean> | null = null;
let loadedClientId = '';

/**
 * Dynamically loads the official PayPal JS SDK with subscription capabilities.
 * Returns true if loaded successfully, or false if clientId is blank.
 */
export async function loadPayPalSdk(options: PayPalScriptOptions): Promise<boolean> {
  const clientId = options.clientId.trim();
  if (!clientId) {
    return false;
  }

  // If already loaded for this client ID
  if (window.paypal && loadedClientId === clientId) {
    return true;
  }

  if (paypalLoadingPromise && loadedClientId === clientId) {
    return paypalLoadingPromise;
  }

  // Remove existing script if client ID changed
  const existing = document.getElementById('paypal-sdk-script');
  if (existing) {
    existing.remove();
  }

  loadedClientId = clientId;

  paypalLoadingPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    const params = new URLSearchParams({
      'client-id': clientId,
      currency: options.currency || 'USD',
      vault: options.vault ? 'true' : 'true',
      intent: options.intent || 'subscription',
    });

    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = (err) => {
      console.warn('Failed to load official PayPal SDK script:', err);
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return paypalLoadingPromise;
}
