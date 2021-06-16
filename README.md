# Stripe SEPA payments POC

This POC is based off of a boilerplate that is unpublished as of now. That boilerplate is heavily based on https://github.com/vercel/next.js/tree/canary/examples/with-chakra-ui-typescript and https://github.com/vercel/next.js/tree/canary/examples/with-typescript-graphql where some basic docs can be found on how to use the internals of this POC

## Live working example

https://clever-mcnulty-2e3118.netlify.app/

## Running Locally

1. Clone repo

```bash
git clone git@github.com:stefangomez/stripe-sepa-poc.git
```

2. Install dependencies

```bash
cd stripe-sepa-poc
yarn install
```

2. Create Environment file, fill with Stripe keys

```bash
cp .env.example .env
# edit .env and fill in stripe test keys
```

3. Run dev app

```bash
yarn dev
```

## Deploy to netlify

Deploys are working via netlify, but not vercel. Vercel's config for nextjs for including additional necessary files (lib/\*.graphqls) for the lambda function doesn't work. Netlify's does, see netlify.toml. Additional config info here: https://docs.netlify.com/configure-builds/common-configurations/next-js/

- make sure to create env variables in Netlify (or wherever you deploy) that replicate your .env file
