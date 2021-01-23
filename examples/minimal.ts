process.env.GOOGLE_LINK_PROVIDER_CALLBACK_URL = '/connect.html';

import express from 'express';
import * as superServer from '@boilerz/super-server';
import mongoPlugin from '@boilerz/super-server-mongo';
import authCorePlugin from '@boilerz/super-server-auth-core';
import logger from '@boilerz/logger';

import path from 'path';
import authGooglePlugin from '../src';

superServer
  .getExpressApp()
  .use(express.static(path.resolve(__dirname, 'public')));

superServer
  .start({
    plugins: [mongoPlugin, authCorePlugin, authGooglePlugin],
  })
  .catch(logger.error);
