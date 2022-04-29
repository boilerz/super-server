process.env.GOOGLE_LINK_PROVIDER_CALLBACK_URL = '/connect.html';

import path from 'path';

import express from 'express';
import { Query, Resolver } from 'type-graphql';

import logger from '@boilerz/logger';
import { SuperServerPlugin } from '@boilerz/super-server';
import * as superServer from '@boilerz/super-server';
import authCorePlugin from '@boilerz/super-server-auth-core';
import mongoPlugin from '@boilerz/super-server-mongo';

import authGooglePlugin from '../src';

@Resolver()
class DummyResolver {
  @Query(() => String)
  yo(): string {
    return 'Yo';
  }
}
superServer
  .getExpressApp()
  .use(express.static(path.resolve(__dirname, 'public')));

superServer
  .start({
    plugins: [
      mongoPlugin,
      authCorePlugin,
      authGooglePlugin,
    ] as SuperServerPlugin[],
    resolvers: [DummyResolver],
  })
  .catch(logger.error);
