import http, { Server } from 'http';

import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import express, { Express } from 'express';
import _ from 'lodash';
import { BuildSchemaOptions } from 'type-graphql';

import logger from '@boilerz/logger';

import config from './config';
import configure from './config/express';
import { GraphQLServerOptions } from './graphql';
import { Resolver, SuperServerPlugin } from './typings';

const app: Express = express();
const server: Server = http.createServer(app);
let serverPlugins: SuperServerPlugin[] = [];

export interface SuperServerOptions {
  plugins?: SuperServerPlugin[];
  resolvers: Resolver[];
  graphQLServerOptions?: GraphQLServerOptions;
  withSignalHandlers?: boolean;
  port?: number;
}

export async function shutdown(exit = false, code?: number): Promise<void> {
  logger.info({ code }, '✘ Server shutdown');
  server.close();

  for (const serverPlugin of serverPlugins) {
    await serverPlugin.tearDown();
  }

  /* istanbul ignore if */
  if (exit) process.exit(0);
}

export function setupSignalHandlers(): void {
  process.on('SIGINT', shutdown.bind(null, true));
  process.on('uncaughtException', (err: Error): Promise<void> => {
    logger.error({ err }, '✘ Uncaught exception');
    return shutdown(true);
  });
}

export async function setup({
  graphQLServerOptions,
  withSignalHandlers = true,
  resolvers,
  plugins = [],
}: SuperServerOptions): Promise<Server> {
  if (withSignalHandlers) setupSignalHandlers();

  const appResolvers = [
    ...resolvers,
    ...(graphQLServerOptions?.buildSchemaOptions?.resolvers || []),
  ];

  // Plugins setup
  for (const plugin of plugins) {
    await plugin.setup();
  }

  let updatedGraphQLServerOptions: GraphQLServerOptions = {
    ...graphQLServerOptions,
    buildSchemaOptions: {
      ...graphQLServerOptions?.buildSchemaOptions,
      resolvers: appResolvers as BuildSchemaOptions['resolvers'],
    },
    context: (context: ExpressContext): Promise<Record<string, unknown>> => {
      return plugins?.reduce(
        async (
          producedContext: Promise<Record<string, unknown>>,
          plugin: SuperServerPlugin,
        ): Promise<Record<string, unknown>> => {
          return {
            ...(await producedContext),
            ...(plugin.buildContext ? await plugin.buildContext(context) : {}),
          };
        },
        Promise.resolve({}),
      );
    },
  };

  for (const plugin of plugins) {
    if (plugin.updateGraphQLServerOptions) {
      updatedGraphQLServerOptions = plugin.updateGraphQLServerOptions(
        updatedGraphQLServerOptions,
      );
    }
  }

  if (_.isEmpty(updatedGraphQLServerOptions.buildSchemaOptions?.resolvers)) {
    throw new Error('Missing resolvers');
  }

  await configure(app, updatedGraphQLServerOptions, plugins);

  return server;
}

export async function start({
  graphQLServerOptions,
  withSignalHandlers = true,
  resolvers,
  plugins = [],
  port,
}: SuperServerOptions): Promise<Server> {
  serverPlugins = plugins;
  await setup({ graphQLServerOptions, withSignalHandlers, resolvers, plugins });

  server.listen(port || config.port);
  logger.info(
    { port: config.port, environment: config.environment },
    '✓ Server started successfully',
  );
  return server;
}

export function getExpressApp(): Express {
  return app;
}

export * from './typings';
