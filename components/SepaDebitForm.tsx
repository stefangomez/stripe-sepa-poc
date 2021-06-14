import React, { useState } from 'react';
import { IbanElement, useStripe, useElements } from '@stripe/react-stripe-js';
import StatusMessages, { useMessages } from './StatusMessages';
import { useSetupPaymentIntentMutation } from 'lib/viewer.graphql';
import {
  Heading,
  VStack,
  Code,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Stack,
  useStyleConfig,
  useTheme,
  css,
} from '@chakra-ui/react';

// const toCSSString = (styles, theme) => serializeStyles([css(styles)(theme)]).styles;

const SepaDebitForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('Jenny Rosen');
  const [email, setEmail] = useState('jenny.rosen@example.com');
  const [messages, addMessage] = useMessages();

  const [setupPaymentIntentMutation] = useSetupPaymentIntentMutation();

  const handleSubmit = async e => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      addMessage('Stripe.js has not yet loaded.');
      return;
    }

    const paymentIntentResponse = await setupPaymentIntentMutation({
      variables: {
        name,
        email,
      },
    });

    const { success, error, clientSecret } = paymentIntentResponse?.data?.setupPaymentIntent || {};

    if (!success) {
      addMessage(error);
      return;
    }

    addMessage('Client secret returned');

    // const { error: stripeError, paymentIntent } = await stripe.confirmSepaDebitPayment(
    //   clientSecret,
    //   {
    //     payment_method: {
    //       sepa_debit: elements.getElement(IbanElement),
    //       billing_details: {
    //         name,
    //         email,
    //       },
    //     },
    //   }
    // );
    const { error: stripeError, setupIntent } = await stripe.confirmSepaDebitSetup(clientSecret, {
      payment_method: {
        sepa_debit: elements.getElement(IbanElement),
        billing_details: {
          name,
          email,
        },
      },
    });

    if (stripeError) {
      // Show error to your customer (e.g., insufficient funds)
      addMessage(stripeError.message);
      return;
    }

    // Initially the test PaymentIntent will be in the `processing` state.
    // We'll refetch the payment intent client-side after 5 seconds to show
    // that it successfully transitions to the `succeeded` state.
    //
    // In practice, you should use webhook notifications for fulfillment.
    if (setupIntent.status === 'processing') {
      addMessage(`Setup processing: ${setupIntent.id} check webhook events for fulfillment.`);
      addMessage('Refetching payment intent in 5s.');
      setTimeout(async () => {
        const { setupIntent: si } = await stripe.retrieveSetupIntent(clientSecret);
        addMessage(`Setup Intent: (${si.id}): ${si.status}`);
      }, 5000);
    } else {
      addMessage(`Setup Intent: (${setupIntent.id}): ${setupIntent.status}`);
    }
  };

  // width: 100%;
  // min-width: 0px;
  // outline: 2px solid transparent;
  // outline-offset: 2px;
  // position: relative;
  // -webkit-appearance: none;
  // -moz-appearance: none;
  // -ms-appearance: none;
  // appearance: none;
  // -webkit-transition: all 0.2s;
  // transition: all 0.2s;
  // font-size: var(--chakra-fontSizes-md);
  // -webkit-padding-start: var(--chakra-space-4);
  // padding-inline-start: var(--chakra-space-4);
  // -webkit-padding-end: var(--chakra-space-4);
  // padding-inline-end: var(--chakra-space-4);
  // height: var(--chakra-sizes-10);
  // border-radius: var(--chakra-radii-md);
  // border: 2px solid;
  // border-color: var(--chakra-colors-transparent);
  // background: var(--chakra-colors-gray-100);

  const theme = useTheme();
  const inputStyles = useStyleConfig('Input', { variant: 'filled', fontSize: 20 });
  // const inputStylesResolved = css(inputStyles.field)(theme);
  // console.log('inputStyles', inputStyles);
  // console.log('inputStylesResolved', inputStylesResolved);

  return (
    <VStack>
      <Heading size='lg'>SEPA Direct Debit</Heading>

      <VStack>
        <Heading size='md'>
          Try a{' '}
          <a href='https://stripe.com/docs/testing#sepa-direct-debit'>test IBAN account number</a>:
        </Heading>
        <VStack>
          <Code>DE89370400440532013000</Code>
          <Code>IE29AIBK93115212345678</Code>
        </VStack>
      </VStack>
      <VStack spacing='20px'>
        <HStack>
          <FormControl isRequired id='name'>
            <FormLabel>Name</FormLabel>
            <Input variant='filled' value={name} onChange={e => setName(e.target.value)} />
          </FormControl>
          <FormControl isRequired id='email'>
            <FormLabel>Email address</FormLabel>
            <Input
              variant='filled'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </FormControl>
        </HStack>

        <Stack
          width='100%'
          // sx={{
          //   '.StripeElement': {
          //     height: '40px',
          //     color: 'rgb(50, 50, 93)',
          //     backgroundColor: 'white',
          //     boxShadow: 'rgb(230, 235, 241) 0px 1px 3px 0px',
          //     padding: '10px 12px',
          //     borderWidth: '1px',
          //     borderStyle: 'solid',
          //     borderColor: 'transparent',
          //     borderImage: 'initial',
          //     borderRadius: '4px',
          //     transition: 'box-shadow 150ms ease 0s',
          //   },
          // }}
          // sx={{
          //   '.StripeElement': inputStyles.field,
          // }}
          spacing='0px'
        >
          <FormLabel htmlFor='iban-element'>Bank Account</FormLabel>
          <IbanElement id='iban-element' options={{ supportedCountries: ['SEPA'] }} />
        </Stack>
        <Button type='submit' onClick={handleSubmit}>
          Setup Payment Method
        </Button>
      </VStack>

      <div id='error-message' role='alert'></div>

      <div id='mandate-acceptance'>
        By providing your bank account details and confirming this payment, you agree to this Direct
        Debit Request and the
        <a href='https://stripe.com/au-becs-dd-service-agreement/legal'>
          Direct Debit Request service agreement
        </a>
        , and authorise Stripe Payments Australia Pty Ltd ACN 160 180 343 Direct Debit User ID
        number 507156 (“Stripe”) to debit your account through the Bulk Electronic Clearing System
        (BECS) on behalf of
        <strong>INSERT YOUR BUSINESS NAME HERE</strong> (the "Merchant") for any amounts separately
        communicated to you by the Merchant. You certify that you are either an account holder or an
        authorised signatory on the account listed above.
      </div>
      {/* <div className='sr-root'>
        <div className='sr-main'>
          <form id='payment-form' className='sr-payment-form'>
            <div className='sr-combo-inputs-row'>
              <div className='col'>
                <label for='name'>Name</label>
                <input id='name' name='name' placeholder='Jenny Rosen' required />
              </div>
              <div className='col'>
                <label for='email'>Email Address</label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='jenny.rosen@example.com'
                  required
                />
              </div>
            </div>

            <div className='sr-combo-inputs-row'>
              <div className='col'>
                <label for='iban-element'>IBAN</label>
                <div id='iban-element'>A Stripe Element will be inserted here.</div>
              </div>
            </div>

            <div id='error-message' className='sr-field-error' role='alert'></div>

            <div className='col' id='mandate-acceptance'>
              By providing your IBAN and confirming this payment, you are authorizing Rocketship
              Inc. and Stripe, our payment service provider, to send instructions to your bank to
              debit your account and your bank to debit your account in accordance with those
              instructions. You are entitled to a refund from your bank under the terms and
              conditions of your agreement with your bank. A refund must be claimed within 8 weeks
              starting from the date on which your account was debited.
            </div>

            <button id='confirm-mandate'>
              <div className='spinner hidden' id='spinner'></div>
              <span id='button-text'>
                Confirm mandate and initiate debit for
                <span id='order-amount'></span>
              </span>
            </button>
          </form>
          <div className='sr-result hidden'>
            <p>
              Payment processing
              <br />
            </p>
            <pre>
              <code></code>
            </pre>
          </div>
        </div>
      </div>
 */}
      <StatusMessages messages={messages} />
    </VStack>
  );
};

export default SepaDebitForm;
