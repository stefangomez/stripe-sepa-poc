import Link from 'next/link';
import { useState } from 'react';
import {
  ViewerQuery,
  useViewerQuery,
  useUpdateNameMutation,
  ViewerDocument,
} from '../lib/viewer.graphql';
import { initializeApollo } from '../lib/apollo';
import { Container } from 'components/Container';
import { Input, Button, Box, Text, Link as ChakraLink, HStack } from '@chakra-ui/react';
import { Main } from 'components/Main';
import { Hero } from 'components/Hero';
import { DarkModeSwitch } from 'components/DarkModeSwitch';
import { Footer } from 'components/Footer';
import { CTA } from 'components/CTA';

const Index = () => {
  const { viewer } = useViewerQuery().data!;
  const [newName, setNewName] = useState('');
  const [updateNameMutation] = useUpdateNameMutation();

  const onChangeName = () => {
    updateNameMutation({
      variables: {
        name: newName,
      },
      //Follow apollo suggestion to update cache
      //https://www.apollographql.com/docs/angular/features/cache-updates/#update
      update: (cache, mutationResult) => {
        const { data } = mutationResult;
        if (!data) return; // Cancel updating name in cache if no data is returned from mutation.
        // Read the data from our cache for this query.
        const { viewer } = cache.readQuery({
          query: ViewerDocument,
        }) as ViewerQuery;
        const newViewer = { ...viewer };
        // Add our comment from the mutation to the end.
        newViewer.name = data.updateName.name;
        // Write our data back to the cache.
        cache.writeQuery({
          query: ViewerDocument,
          data: { viewer: newViewer },
        });
      },
    });
  };

  return (
    <Container height='100vh'>
      <Hero />
      <Main>
        <Text>
          You're signed in as{' '}
          <Text as='span' color='black' fontWeight='bold'>
            {viewer.name}
          </Text>{' '}
          and you're {viewer.status}. Go to the{' '}
          <ChakraLink as={Link} href='/about'>
            <a>
              <Text as='span' color='teal'>
                about
              </Text>
            </a>
          </ChakraLink>{' '}
          page.
        </Text>
        <HStack>
          <Input placeholder='your new name...' onChange={e => setNewName(e.target.value)} />
          <Button onClick={onChangeName}>change</Button>
        </HStack>
      </Main>
      <DarkModeSwitch />
      <Footer>
        <Text>Next ❤️ Chakra</Text>
      </Footer>
      <CTA />
    </Container>
  );
};

export async function getStaticProps() {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: ViewerDocument,
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}

export default Index;
