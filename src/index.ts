import passport from 'passport';
import type {
  GraphQLServerOptions,
  SuperServerPlugin,
} from '@boilerz/super-server';
import strategy from './strategy';
import GoogleAuthenticationResolver from './resolver/authentication';
import configureExpress from './config/express';

const plugin: SuperServerPlugin = {
  configure: configureExpress,

  updateGraphQLServerOptions(
    options: GraphQLServerOptions,
  ): GraphQLServerOptions {
    return {
      ...options,
      buildSchemaOptions: {
        ...options.buildSchemaOptions,
        resolvers: [
          ...(options?.buildSchemaOptions?.resolvers || []),
          GoogleAuthenticationResolver,
        ],
      },
    };
  },

  async setup(): Promise<void> {
    passport.use(strategy);
  },

  async tearDown(): Promise<void> {
    // Noop
  },
};

export default plugin;
