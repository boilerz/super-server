import passport from 'passport';
import { NonEmptyArray } from 'type-graphql';

import type {
  GraphQLServerOptions,
  SuperServerPlugin,
} from '@boilerz/super-server';

import configureExpress from './config/express';
import GoogleAuthenticationResolver from './resolver/authentication';
import strategy from './strategy';

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
          ...((options?.buildSchemaOptions
            ?.resolvers as NonEmptyArray<Function>) || []),
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
