import { Arg, Query, Resolver } from 'type-graphql';
import * as superServer from '@boilerz/super-server';
import mongoPlugin from '@boilerz/super-server-mongo';
import logger from '@boilerz/logger';

import authCorePlugin from '../src';

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
    plugins: [mongoPlugin, authCorePlugin],
  })
  .catch(logger.error);
