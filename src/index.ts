import type { Express } from 'express';
import passport from 'passport';
import mail from '@sendgrid/mail';
import type {
  SuperServerPlugin,
  GraphQLServerOptions,
} from '@boilerz/super-server';
import assert from 'assert';
import type { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import AuthenticationResolver from './resolver/authentication';
import * as emailHelper from './helper/email';
import config from './config';
import { authChecker, AuthCoreContext } from './helper/authentication';

const plugin: SuperServerPlugin<AuthCoreContext> = {
  async configure(app: Express): Promise<void> {
    app.use(passport.initialize());
  },

  updateGraphQLServerOptions(
    options: GraphQLServerOptions,
  ): GraphQLServerOptions {
    return {
      ...options,
      buildSchemaOptions: {
        ...options.buildSchemaOptions,
        resolvers: [AuthenticationResolver],
        authChecker,
      },
    };
  },

  buildContext({ req }: ExpressContext): AuthCoreContext {
    const authorizationHeader: string | undefined = req.header('Authorization');

    return {
      accessToken: authorizationHeader
        ? authorizationHeader.replace('Bearer ', '')
        : null,
    };
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

export type { AuthCoreContext };

export default plugin;
