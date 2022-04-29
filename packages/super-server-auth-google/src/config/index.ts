import logger from '@boilerz/logger';

export interface Config {
  environment: string;
  host: string;
  google: {
    scope: string[];
    clientID: string;
    clientSecret: string;
  };
  failureRedirect: string;
  linkProviderCallbackURL: string;
}

const environment: string = process.env.NODE_ENV || 'development';

if (environment !== 'test' && !process.env.GOOGLE_CLIENT_ID) {
  logger.error('GOOGLE_CLIENT_ID env var is not defined');
  throw new Error('Missing GOOGLE_CLIENT_ID');
}

if (environment !== 'test' && !process.env.GOOGLE_CLIENT_SECRET) {
  logger.error('GOOGLE_CLIENT_SECRET env var is not defined');
  throw new Error('Missing GOOGLE_CLIENT_SECRET');
}

const defaultScope =
  'https://www.googleapis.com/auth/userinfo.profile,https://www.googleapis.com/auth/userinfo.email';
if (!process.env.GOOGLE_OAUTH_SCOPE) {
  logger.warn({ defaultScope }, 'GOOGLE_OAUTH_SCOPE env var is not defined');
}

const host = process.env.SERVER_HOST || 'http://localhost:3000';

const config: Config = {
  host,
  environment,
  google: {
    scope: (process.env.GOOGLE_OAUTH_SCOPE || defaultScope).split(','),
    clientID: process.env.GOOGLE_CLIENT_ID || 'test.client.id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test.client.secret',
  },
  failureRedirect: process.env.GOOGLE_FAILURE_REDIRECT || '/login',
  linkProviderCallbackURL:
    process.env.GOOGLE_LINK_PROVIDER_CALLBACK_URL || `${host}/auth/connect`,
};

export default config;
