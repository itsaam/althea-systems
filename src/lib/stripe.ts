import Stripe from "stripe";

// Lazy initialization - ne crash pas au build, seulement à l'utilisation
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not defined");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

// Export pour compatibilité avec le code existant
export const stripe = {
  get instance() {
    return getStripe();
  },
  checkout: {
    sessions: {
      create: (params: Stripe.Checkout.SessionCreateParams) =>
        getStripe().checkout.sessions.create(params),
      retrieve: (id: string) => getStripe().checkout.sessions.retrieve(id),
    },
  },
  webhooks: {
    constructEvent: (
      payload: string | Buffer,
      signature: string,
      secret: string
    ) => getStripe().webhooks.constructEvent(payload, signature, secret),
  },
};

export async function createCheckoutSession(params: {
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: params.lineItems,
    mode: "payment",
    customer_email: params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  });

  return session;
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
  }

  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
