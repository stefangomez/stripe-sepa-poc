import { Link as ChakraLink, Text, Center } from '@chakra-ui/react';
import { CheckCircleIcon, LinkIcon } from '@chakra-ui/icons';

import { Hero } from '../components/Hero';
import { Container } from '../components/Container';
import { Main } from '../components/Main';
import { DarkModeSwitch } from '../components/DarkModeSwitch';
import { CTA } from '../components/CTA';
import { Footer } from '../components/Footer';
import SepaDebitForm from '../components/SepaDebitForm';

const SepaPage = () => (
  <Container height='100vh'>
    <Center maxW='500px'>
      <SepaDebitForm />
    </Center>

    <DarkModeSwitch />
  </Container>
);

export default SepaPage;
