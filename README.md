# @boilerz/super-server-auth-core

[![GitHub package.json version](https://img.shields.io/github/package-json/v/boilerz/super-server-auth-core)](https://www.npmjs.com/package/@boilerz/super-server-auth-core)
[![CircleCI](https://circleci.com/gh/boilerz/super-server-auth-core/tree/master.svg?style=shield)](https://circleci.com/gh/boilerz/super-server-auth-core/tree/master)
[![codecov](https://codecov.io/gh/boilerz/super-server-auth-core/branch/master/graph/badge.svg)](https://codecov.io/gh/boilerz/super-server-auth-core)

> Core module for authentication support on super server

### Install

```bash
npx install-peerdeps @boilerz/super-server-auth-core
```

### Usage

This plugin add support for a sign up resolver and it is required for other `super-server-auth-*` plugin.
It need a mongo setup to work so the plugin `@boilerz/super-server-mongo` need to be set before this one.

```typescript
import { Arg, Query, Resolver } from 'type-graphql';
import * as superServer from '@boilerz/super-server';
import mongoPlugin from '@boilerz/super-server-mongo';
import authCorePlugin from '@boilerz/super-server-auth-core';

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
    plugins: [mongoPlugin, authCorePlugin], // <-- Plugin here (after mongoPlugin)
  })
  .catch(console.error);
```

In situation example with local auth plugin [example](https://github.com/boilerz/super-server/blob/master/examples/withLocalAuth.ts)


### Release

```bash
yarn version
yarn build
yarn publish dist --access public
```

# Env vars

| Name               | Default                   | Description                                                     |
|--------------------|---------------------------|-----------------------------------------------------------------|
| JWT_SECRET         |                           | JWT secret                                                      |
| JWT_EXPIRE_IN      | `30 * 60 * 1000`          | Token expiration in seconds.                                    |
