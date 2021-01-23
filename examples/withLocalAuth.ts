import 'reflect-metadata';
import { Arg, Authorized, Ctx, Query, Resolver } from 'type-graphql';

import logger from '@boilerz/logger';
import authCorePlugin, {
  AuthCoreContext,
} from '@boilerz/super-server-auth-core';
import authLocalPlugin from '@boilerz/super-server-auth-local';
import mongoPlugin from '@boilerz/super-server-mongo';

import * as superServer from '../src';

@Resolver()
class GreetingResolver {
  @Query(() => String)
  public hello(@Arg('name') name: string): string {
    return `Hello ${name}`;
  }

  @Authorized()
  @Query(() => String)
  public authenticatedHello(@Ctx() context: AuthCoreContext): string {
    return `Hello ${context.decodedToken?.firstName}`;
  }
}

superServer
  .start({
    resolvers: [GreetingResolver],
    plugins: [mongoPlugin, authCorePlugin, authLocalPlugin],
  })
  .catch((err) => logger.error({ err }, '[examples/withLocalAuth]'));
