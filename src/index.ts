import type { Express } from 'express';
import passport from 'passport';
import * as jwt from 'jsonwebtoken';
import type {
  SuperServerPlugin,
  GraphQLServerOptions,
} from '@boilerz/super-server';
import type { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import AuthenticationResolver from './resolver/authentication';
import * as emailHelper from './helper/email';
import config from './config';
import {
  authChecker,
  AuthCoreContext,
  DecodedToken,
} from './helper/authentication';

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
    const accessToken = authorizationHeader
      ? authorizationHeader.replace('Bearer ', '')
      : null;
    let decodedToken: DecodedToken | null = null;
    try {
      decodedToken = accessToken
        ? (jwt.verify(accessToken, config.jwt.secret) as DecodedToken)
        : null;
    } catch (err) {
      // Noop
    }
    return {
      accessToken,
      decodedToken,
    };
  },

  async setup(): Promise<void> {
    if (!config.isMailingSupportEnabled) return;

    await emailHelper.setupEmailValidationPublisherClient();
  },

  async tearDown(): Promise<void> {
    if (!config.isMailingSupportEnabled) return;

    await emailHelper.getPublisherClient().tearDown();
  },
};

export type { AuthCoreContext };

export default plugin;
