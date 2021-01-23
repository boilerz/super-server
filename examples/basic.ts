import { Arg, Query, Resolver } from 'type-graphql';

import logger from '@boilerz/logger';

import * as superServer from '../src';

@Resolver()
class GreetingResolver {
  @Query(() => String)
  public hello(@Arg('name') name: string): string {
    return `Hello ${name}`;
  }
}

superServer
  .start({ resolvers: [GreetingResolver] })
  .catch((err) => logger.error({ err }, '[examples/basic]'));
