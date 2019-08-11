# @boilerz/super-server

[![GitHub package.json version](https://img.shields.io/github/package-json/v/boilerz/super-server)](https://www.npmjs.com/package/@boilerz/super-server)
[![CircleCI](https://circleci.com/gh/boilerz/super-server.svg?style=shield)](https://circleci.com/gh/boilerz/super-server)
> Express server with type-graphql. 

### Install

```bash
npx install-peerdeps @boilerz/super-server
```

### Usage

```typescript
import server from 'super-server';
import { Arg, Query, Resolver } from 'type-graphql';

@Resolver()
class GreetingResolver {
  @Query(() => String)
  public hello(@Arg('name') name: string): string {
    return `Hello ${name}`;
  }
}

// Start the server with your resolvers
server.start({ resolvers: [GreetingResolver] });

// For full control:
server.start({
  graphQLServerOptions: {
    buildSchemaOptions: {
      resolvers: [GreetingResolver],
    },
  },
});
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
