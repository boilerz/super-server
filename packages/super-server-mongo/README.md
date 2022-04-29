# @boilerz/super-server-mongo

[![GitHub package.json version](https://img.shields.io/github/package-json/v/boilerz/super-server-mongo)](https://www.npmjs.com/package/@boilerz/super-server-mongo)
[![GH CI Action](https://github.com/boilerz/super-server-mongo/workflows/CI/badge.svg)](https://github.com/boilerz/super-server-mongo/actions?query=workflow:CI)
[![codecov](https://codecov.io/gh/boilerz/super-server-mongo/branch/master/graph/badge.svg)](https://codecov.io/gh/boilerz/super-server-mongo)

> Mongo database support for super server

### Install

```bash
npx install-peerdeps @boilerz/super-server-mongo
```

### Usage


```typescript
import { Arg, Query, Resolver } from 'type-graphql';
import * as superServer from '@boilerz/super-server';
import mongoPlugin from '@boilerz/super-server-mongo';

@Resolver()
class GreetingResolver {
  @Query(() => String)
  public hello(@Arg('name') name: string): string {
    return `Hello ${name}`;
  }
}

superServer
  .start({
    resolvers: [GreetingResolver],
    plugins: [mongoPlugin], // <-- Plugin here
  })
  .catch(console.error);
```

Another example with local auth plugin [example](https://github.com/boilerz/super-server/blob/master/examples/withLocalAuth.ts)

### Release

```bash
yarn version
yarn build
yarn publish dist --access public
```
