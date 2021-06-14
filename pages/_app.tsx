import { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { useApollo } from '../lib/apollo';
import theme from '../theme';

export default function App({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps.initialApolloState);
  const stripePromise = loadStripe(
    'pk_test_51GtFaoH5vJQeh1svEizSPnzb2njQyOmwJSr1pYQJxNgLbrGnLdcabHqvRXGFgsAHUq6pF07cKBU3IqBDR66wvM1m00nF9phkZx'
  );

  return (
    <Elements stripe={stripePromise}>
      <ApolloProvider client={apolloClient}>
        <ChakraProvider resetCSS theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </ApolloProvider>
    </Elements>
  );
}
