import Stripe from "stripe";

// Lazy initialization — Stripe constructor throws if apiKey is missing.
// Module is imported during Next.js build "collect page data" stage where
// env vars may not be available; we defer client creation until first use.
let _client: Stripe | null = null;

function getClient(): Stripe {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  _client = new Stripe(key);
  return _client;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return Reflect.get(getClient(), prop);
  },
});
