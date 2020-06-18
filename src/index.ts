import type { Express } from 'express';
import passport from 'passport';
import mail from '@sendgrid/mail';
import type { Resolver, SuperServerPlugin } from '@boilerz/super-server';
import assert from 'assert';
import AuthenticationResolver from './resolver/authentication';
import * as emailHelper from './helper/email';
import config from './config';

const plugin: SuperServerPlugin = {
  async configure(app: Express): Promise<void> {
    app.use(passport.initialize());
  },

  getResolvers(): Resolver[] {
    return [AuthenticationResolver];
  },

  async setup(): Promise<void> {
    assert(config.host, 'SERVER_HOST need to be set');
    assert(config.sendgrid.apiKey, 'SENDGRID_API_KEY need to be set');
    assert(config.sendgrid.senderEmail, 'SENDER_EMAIL need to be set');
    assert(
      config.sendgrid.mailTemplates.emailValidationId,
      'EMAIL_VALIDATION_TEMPLATE_ID need to be set',
    );

    mail.setApiKey(config.sendgrid.apiKey);
    await emailHelper.setupEmailValidationPublisherClient();
  },

  async tearDown(): Promise<void> {
    await emailHelper.getPublisherClient().tearDown();
  },
};

export default plugin;
