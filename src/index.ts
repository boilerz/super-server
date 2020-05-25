import http, { Server } from 'http';

import express, { Express } from 'express';
import _ from 'lodash';

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
  resolvers?: Resolver[];
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
  process.on('SIGINT', shutdown.bind(null, { exit: true }));
  process.on(
    'uncaughtException',
    (err: Error): Promise<void> => {
      logger.error({ err }, '✘ Uncaught exception');
      return shutdown(true);
    },
  );
}

export async function setup({
  graphQLServerOptions = {},
  withSignalHandlers = true,
  resolvers = [],
  plugins = [],
}: SuperServerOptions = {}): Promise<Server> {
  if (withSignalHandlers) setupSignalHandlers();
  if (
    _.isEmpty(resolvers) &&
    _.isEmpty(_.get(graphQLServerOptions, 'buildSchemaOptions.resolvers'))
  ) {
    throw new Error('Missing resolvers');
  }

  // Plugins setup
  for (const plugin of plugins) {
    await plugin.setup();
  }

  await configure(
    app,
    {
      ...graphQLServerOptions,
      buildSchemaOptions: {
        ...graphQLServerOptions.buildSchemaOptions,
        resolvers: [
          ..._.get(graphQLServerOptions, 'buildSchemaOptions.resolvers', []),
          ...resolvers,
          _.flatten(plugins.map(plugin => plugin.getResolvers())),
        ],
      },
    },
    plugins,
  );
  return server;
}

export async function start({
  graphQLServerOptions = {},
  withSignalHandlers = true,
  resolvers = [],
  plugins = [],
  port,
}: SuperServerOptions = {}): Promise<Server> {
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
