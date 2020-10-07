# @boilerz/super-server

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/boilerz/super-server/blob/master/LICENSE)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/boilerz/super-server)](https://www.npmjs.com/package/@boilerz/super-server)
[![CircleCI](https://circleci.com/gh/boilerz/super-server.svg?style=shield)](https://circleci.com/gh/boilerz/super-server)
[![codecov](https://codecov.io/gh/boilerz/super-server/branch/master/graph/badge.svg)](https://codecov.io/gh/boilerz/super-server)

> Express server with type-graphql. 

### Install

```bash
npx install-peerdeps @boilerz/super-server
```

### Usage

```typescript
import * as superServer from '@boilerz/super-server';
import { Arg, Query, Resolver } from 'type-graphql';

@Resolver()
class GreetingResolver {
  @Query(() => String)
  public hello(@Arg('name') name: string): string {
    return `Hello ${name}`;
  }
}

// Start the server with your resolvers
superServer.start({ resolvers: [GreetingResolver] });

// OR

// For more control on the underlying express app (the server is not automatically started):
const server = superServer.setup({
  graphQLServerOptions: {
    buildSchemaOptions: {
      resolvers: [GreetingResolver],
    },
  },
});

// Express configuration
superServer.getExpressApp().get('/yo', (req, res) => res.send('Yo'));

// Manually start the server
server.listen(process.env.PORT);
```

Some configuration can only be changed by env vars:

| Name               | Default                   | Description                                                     |
|--------------------|---------------------------|-----------------------------------------------------------------|
| PORT               | `3000`                    | Server port.                                                    |
| ALLOWED_DOMAINS    | `/http:\/\/localhost.*/`  | CORS whitelisted domains (separated using a comma).             |
| SSL_REDIRECT       | `false`                   | Have to be set to `true` to redirect any http request to https. |

For the `@boilerz/logger`'s configuration here the [readme](https://github.com/boilerz/logger#usage).

### Release

```bash
yarn version
yarn build
yarn publish dist --access public
```
