import { Center } from '@chakra-ui/react';
import { Container } from '../components/Container';
import SepaDebitForm from '../components/SepaDebitForm';

const SepaPage = () => (
  <Container height='100vh'>
    <Center maxW='500px'>
      <SepaDebitForm />
    </Center>
  </Container>
);

export default SepaPage;
