import {
  Button,
  Code,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { IbanElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { StripeIbanElementChangeEvent } from '@stripe/stripe-js';
import { useSetupPaymentIntentMutation } from 'lib/viewer.graphql';
import React, { useCallback, useEffect, useState } from 'react';
import StatusMessages, { useMessages } from './StatusMessages';

const SepaDebitForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('Jenny Rosen');
  const [email, setEmail] = useState('jenny.rosen@example.com');
  const [messages, addMessage] = useMessages();
  const [isIbanValid, setIsIbanValid] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

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
    console.log('setupIntent', setupIntent);
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

  const inputStyles = {
    color: '#16161D',
    fontFamily:
      '-apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    fontSize: '16px',
    lineHeight: '36px',
    '::placeholder': {
      fontFamily:
        '-apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      color: '#A0AEC0',
      fontWeight: '400',
    },
  };

  const handleIbanChange = useCallback((e: StripeIbanElementChangeEvent) => {
    console.log('ibanChangeEvent: e', e);
    setIsIbanValid(e.complete);
  }, []);

  useEffect(() => {
    console.log('useEffect ran for name, email, isIbanValid', name, email, isIbanValid);
    setIsFormValid(name && email && isIbanValid);
  }, [name, email, isIbanValid]);
  return (
    <VStack>
      <Heading size='lg'>SEPA Direct Debit</Heading>

      {(!stripe || !elements) && <Spinner />}
      {stripe && elements && (
        <>
          <VStack>
            <Heading size='md'>
              Try a{' '}
              <a href='https://stripe.com/docs/testing#sepa-direct-debit'>
                test IBAN account number
              </a>
              :
            </Heading>
            <VStack>
              <Code>DE89370400440532013000</Code>
              <Code>IE29AIBK93115212345678</Code>
            </VStack>
          </VStack>
          <VStack spacing='20px'>
            <HStack width='100%'>
              <FormControl isInvalid={!name} isRequired id='name'>
                <FormLabel>Name</FormLabel>
                <Input
                  placeholder='Jane Doe'
                  variant='filled'
                  value={name}
                  _focus={{ background: '#FFF', borderColor: '#3182ce' }}
                  onChange={e => setName(e.target.value)}
                />
              </FormControl>
              <FormControl isInvalid={!email} isRequired id='email'>
                <FormLabel>Email address</FormLabel>
                <Input
                  placeholder='jane.doe@email.com'
                  variant='filled'
                  type='email'
                  value={email}
                  _focus={{ background: '#FFF', borderColor: '#3182ce' }}
                  onChange={e => setEmail(e.target.value)}
                />
              </FormControl>
            </HStack>

            <Stack
              width='100%'
              sx={{
                '.StripeElement': {
                  outline: '2px solid transparent',
                  outlineOffset: '2px',
                  border: '2px solid',
                  borderColor: 'transparent',
                  borderRadius: 'md',
                  transition: 'all 0.2s',
                  height: '40px',
                  padding: '0 16px',
                  background: '#EDF2F7',
                  width: '100%',
                },
                '.StripeElement--focus': {
                  borderColor: '#3182ce',
                  background: '#FFF',
                },
                '.StripeElement--webkit-autofill': {
                  background: 'rgb(232, 240, 254) !important',
                },
                '.StripeElement--invalid': {
                  borderColor: '#E53E3E',
                },
              }}
              _hover={{
                '.StripeElement': { background: '#E2E8F0' },
                '.StripeElement.StripeElement--focus': { background: '#FFF' },
              }}
              spacing='0px'
            >
              <FormLabel htmlFor='iban-element'>Bank Account</FormLabel>
              <IbanElement
                id='iban-element'
                options={{
                  supportedCountries: ['SEPA'],
                  style: { base: inputStyles, invalid: { color: '#16161D' } },
                }}
                onChange={handleIbanChange}
              />
            </Stack>

            <Text fontSize='xs'>
              By providing your payment information and confirming this payment, you authorise (A){' '}
              <strong>Business Name</strong> and Stripe, our payment service provider, to send
              instructions to your bank to debit your account and (B) your bank to debit your
              account in accordance with those instructions. As part of your rights, you are
              entitled to a refund from your bank under the terms and conditions of your agreement
              with your bank. A refund must be claimed within 8 weeks starting from the date on
              which your account was debited. Your rights are explained in a statement that you can
              obtain from your bank. You agree to receive notifications for future debits up to 2
              days before they occur.
            </Text>

            <Button
              disabled={!isFormValid}
              type='submit'
              colorScheme='twitter'
              onClick={handleSubmit}
            >
              Setup Payment Method
            </Button>
          </VStack>

          <StatusMessages messages={messages} />
        </>
      )}
    </VStack>
  );
};

export default SepaDebitForm;
