export interface Config {
  environment: string;
  port: number;
  cors: {
    allowedDomains: RegExp | RegExp[] | string | string[];
  };
  ssl: {
    redirect: boolean;
  };
}

const environment: string = process.env.NODE_ENV || 'development';

const config: Config = {
  environment,
  port: parseInt(process.env.PORT || '3000', 10),
  cors: {
    allowedDomains: process.env.ALLOWED_DOMAINS
      ? process.env.ALLOWED_DOMAINS.split(',')
      : /http:\/\/localhost.*/,
  },
  ssl: {
    redirect: process.env.SSL_REDIRECT === 'true',
  },
};

export default config;
