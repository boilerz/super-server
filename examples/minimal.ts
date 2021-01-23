process.env.GOOGLE_LINK_PROVIDER_CALLBACK_URL = '/connect.html';

import path from 'path';

import express from 'express';

import logger from '@boilerz/logger';
import * as superServer from '@boilerz/super-server';
import authCorePlugin from '@boilerz/super-server-auth-core';
import mongoPlugin from '@boilerz/super-server-mongo';

import authGooglePlugin from '../src';

superServer
  .getExpressApp()
  .use(express.static(path.resolve(__dirname, 'public')));

superServer
  .start({
    plugins: [mongoPlugin, authCorePlugin, authGooglePlugin],
  })
  .catch(logger.error);
