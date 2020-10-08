import * as jwt from 'jsonwebtoken';
import logger from '@boilerz/logger';

export interface Config {
  host: string;
  emailValidationExpiresDuration: number;
  waitingDurationBeforeNextEmailAttempt: number;
  sendgrid: {
    apiKey: string;
    senderEmail: string;
    mailTemplates: {
      emailValidationId: string;
    };
  };
  jwt: {
    secret: string;
    signOptions: jwt.SignOptions;
  };
}

const signOptions: jwt.SignOptions = {
  expiresIn: parseInt(
    process.env.JWT_EXPIRE_IN || (30 * 60 * 1000).toString(),
    10,
  ),
};

if (!process.env.JWT_SECRET) {
  logger.warn('JWT_SECRET env var is not defined');
}

if (!process.env.JWT_EXPIRE_IN) {
  logger.warn(
    { defaultExpiresIn: signOptions.expiresIn },
    'JWT_EXPIRE_IN env var is not defined (second units)',
  );
}

const config: Config = {
  host: process.env.SERVER_HOST || 'http://localhost:3000',
  emailValidationExpiresDuration: parseInt(
    process.env.EMAIL_VALIDATION_EXPIRES_DURATION || '48',
    10,
  ),
  waitingDurationBeforeNextEmailAttempt: parseInt(
    process.env.WAITING_DURATION_BEFORE_NEXT_EMAIL_ATTEMPT || '5000',
    10,
  ),
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY!,
    senderEmail: process.env.SENDER_EMAIL!,
    mailTemplates: {
      emailValidationId: process.env.EMAIL_VALIDATION_TEMPLATE_ID!,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || Math.random().toString(36),
    signOptions,
  },
};

export default config;
