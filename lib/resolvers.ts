import { QueryResolvers, MutationResolvers } from '@graphql-types@';
import { ResolverContext } from './apollo';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

const userProfile = {
  id: String(1),
  name: 'John Smith',
  status: 'cached',
};

const Query: Required<QueryResolvers<ResolverContext>> = {
  viewer(_parent, _args, _context, _info) {
    return userProfile;
  },
};

const Mutation: Required<MutationResolvers<ResolverContext>> = {
  updateName(_parent, _args, _context, _info) {
    userProfile.name = _args.name;
    return userProfile;
  },
  setupPaymentIntent: async (_parent, _args, _context, _info) => {
    const { email, name } = _args;
    const customer = await stripe.customers.create({ email, name });
    const params: Stripe.SetupIntentCreateParams = {
      payment_method_types: ['sepa_debit'],
      customer: customer.id,
    };

    try {
      const setupIntent: Stripe.SetupIntent = await stripe.setupIntents.create(params);
      // Send publishable key and PaymentIntent client_secret to client.
      return { success: true, clientSecret: setupIntent.client_secret };
    } catch (e) {
      return {
        success: true,
        error: e.message,
      };
    }
  },
};

export default { Query, Mutation };
