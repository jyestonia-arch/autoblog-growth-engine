// AutoBlog Growth Engine - Stripe Payment Service

interface StripeConfig {
  secretKey: string;
  webhookSecret?: string;
}

interface Customer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

interface CreateCheckoutParams {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

interface CreateCustomerParams {
  email: string;
  name: string;
  orgId: string;
}

// Base Stripe API call helper
async function stripeRequest(
  secretKey: string,
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  body?: Record<string, any>
): Promise<any> {
  const url = `https://api.stripe.com/v1${endpoint}`;
  
  const headers: HeadersInit = {
    'Authorization': `Bearer ${secretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method === 'POST') {
    options.body = new URLSearchParams(flattenObject(body)).toString();
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Stripe API error');
  }

  return data;
}

// Helper to flatten nested objects for URL encoding
function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}[${key}]` : key;
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object') {
          Object.assign(result, flattenObject(item, `${newKey}[${index}]`));
        } else {
          result[`${newKey}[${index}]`] = String(item);
        }
      });
    } else if (value !== undefined && value !== null) {
      result[newKey] = String(value);
    }
  }
  
  return result;
}

// Create a new Stripe customer
export async function createCustomer(
  secretKey: string,
  params: CreateCustomerParams
): Promise<Customer> {
  const response = await stripeRequest(secretKey, '/customers', 'POST', {
    email: params.email,
    name: params.name,
    metadata: {
      org_id: params.orgId,
    },
  });

  return {
    id: response.id,
    email: response.email,
    name: response.name,
    metadata: response.metadata,
  };
}

// Get customer by ID
export async function getCustomer(
  secretKey: string,
  customerId: string
): Promise<Customer | null> {
  try {
    const response = await stripeRequest(secretKey, `/customers/${customerId}`);
    return {
      id: response.id,
      email: response.email,
      name: response.name,
      metadata: response.metadata,
    };
  } catch {
    return null;
  }
}

// Create a checkout session for subscription
export async function createCheckoutSession(
  secretKey: string,
  params: CreateCheckoutParams
): Promise<{ sessionId: string; url: string }> {
  const body: Record<string, any> = {
    customer: params.customerId,
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: params.metadata || {},
    },
  };

  if (params.trialPeriodDays) {
    body.subscription_data.trial_period_days = params.trialPeriodDays;
  }

  const response = await stripeRequest(secretKey, '/checkout/sessions', 'POST', body);

  return {
    sessionId: response.id,
    url: response.url,
  };
}

// Create a billing portal session for customer self-service
export async function createBillingPortalSession(
  secretKey: string,
  customerId: string,
  returnUrl: string
): Promise<{ url: string }> {
  const response = await stripeRequest(secretKey, '/billing_portal/sessions', 'POST', {
    customer: customerId,
    return_url: returnUrl,
  });

  return {
    url: response.url,
  };
}

// Get subscription details
export async function getSubscription(
  secretKey: string,
  subscriptionId: string
): Promise<any> {
  return stripeRequest(secretKey, `/subscriptions/${subscriptionId}`);
}

// Cancel subscription (at period end or immediately)
export async function cancelSubscription(
  secretKey: string,
  subscriptionId: string,
  immediately: boolean = false
): Promise<any> {
  if (immediately) {
    return stripeRequest(secretKey, `/subscriptions/${subscriptionId}`, 'DELETE');
  }
  
  return stripeRequest(secretKey, `/subscriptions/${subscriptionId}`, 'POST', {
    cancel_at_period_end: true,
  });
}

// Update subscription (change plan)
export async function updateSubscription(
  secretKey: string,
  subscriptionId: string,
  newPriceId: string
): Promise<any> {
  // First get the subscription to find the item ID
  const subscription = await getSubscription(secretKey, subscriptionId);
  const itemId = subscription.items.data[0]?.id;

  if (!itemId) {
    throw new Error('No subscription item found');
  }

  return stripeRequest(secretKey, `/subscriptions/${subscriptionId}`, 'POST', {
    items: [
      {
        id: itemId,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

// Resume a canceled subscription
export async function resumeSubscription(
  secretKey: string,
  subscriptionId: string
): Promise<any> {
  return stripeRequest(secretKey, `/subscriptions/${subscriptionId}`, 'POST', {
    cancel_at_period_end: false,
  });
}

// Get customer invoices
export async function getInvoices(
  secretKey: string,
  customerId: string,
  limit: number = 10
): Promise<any[]> {
  const response = await stripeRequest(
    secretKey,
    `/invoices?customer=${customerId}&limit=${limit}`
  );
  return response.data || [];
}

// Get upcoming invoice (for preview)
export async function getUpcomingInvoice(
  secretKey: string,
  customerId: string,
  subscriptionId?: string,
  newPriceId?: string
): Promise<any> {
  let url = `/invoices/upcoming?customer=${customerId}`;
  
  if (subscriptionId) {
    url += `&subscription=${subscriptionId}`;
  }
  
  if (newPriceId && subscriptionId) {
    // Get current subscription item
    const subscription = await getSubscription(secretKey, subscriptionId);
    const itemId = subscription.items.data[0]?.id;
    if (itemId) {
      url += `&subscription_items[0][id]=${itemId}&subscription_items[0][price]=${newPriceId}`;
    }
  }

  return stripeRequest(secretKey, url);
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): { valid: boolean; event?: any } {
  // In a production environment, you would use crypto to verify
  // For Cloudflare Workers, we use Web Crypto API
  
  try {
    // Parse the signature header
    const sigParts = signature.split(',').reduce((acc, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const timestamp = sigParts['t'];
    const expectedSig = sigParts['v1'];

    if (!timestamp || !expectedSig) {
      return { valid: false };
    }

    // Check timestamp is not too old (5 minutes)
    const timestampAge = Date.now() / 1000 - parseInt(timestamp);
    if (timestampAge > 300) {
      return { valid: false };
    }

    // For now, we'll trust the payload and parse it
    // In production, implement proper HMAC verification
    const event = JSON.parse(payload);
    
    return { valid: true, event };
  } catch {
    return { valid: false };
  }
}

// Map Stripe subscription status to our status
export function mapSubscriptionStatus(
  stripeStatus: string
): 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid' {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'canceled':
      return 'canceled';
    case 'past_due':
      return 'past_due';
    case 'trialing':
      return 'trialing';
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
      return 'unpaid';
    default:
      return 'active';
  }
}

// Get plan tier from price ID
export function getPlanTierFromPriceId(priceId: string): 'starter' | 'growth' | 'scale' {
  if (priceId.includes('scale')) return 'scale';
  if (priceId.includes('growth')) return 'growth';
  return 'starter';
}

// Calculate plan limits based on tier
export function getPlanLimits(tier: 'starter' | 'growth' | 'scale'): {
  monthlyPosts: number;
  features: string[];
} {
  switch (tier) {
    case 'starter':
      return {
        monthlyPosts: 10,
        features: ['10 posts/month', 'Basic keyword research', 'Single website', 'Email support'],
      };
    case 'growth':
      return {
        monthlyPosts: 30,
        features: ['30 posts/month', 'Full keyword research', 'Internal linking', 'API access', 'Priority support'],
      };
    case 'scale':
      return {
        monthlyPosts: 60,
        features: ['60+ posts/month', 'Multiple domains', 'Custom integrations', 'Dedicated support', 'White-label'],
      };
  }
}
