import { Arg, Query, Resolver } from 'type-graphql';

import logger from '@boilerz/logger';
import * as superServer from '@boilerz/super-server';
import { SuperServerPlugin } from '@boilerz/super-server';
import authCorePlugin from '@boilerz/super-server-auth-core';
import mongoPlugin from '@boilerz/super-server-mongo';

import authLocalPlugin from '../src';

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
    plugins: [
      mongoPlugin,
      authCorePlugin,
      authLocalPlugin,
    ] as SuperServerPlugin[],
  })
  .catch((err) => logger.error({ err }));
