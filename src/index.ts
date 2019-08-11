import http, { Server } from 'http';

import express, { Express } from 'express';
import _ from 'lodash';

import logger from '@boilerz/logger';
import config from './config';
import configure from './config/express';
import { GraphQLServerOptions } from './graphql';

const app: Express = express();
const server: Server = http.createServer(app);

export interface SuperServerOptions {
  resolvers?: (Function | string)[];
  graphQLServerOptions?: GraphQLServerOptions;
  withSignalHandlers?: boolean;
  port?: number;
}

export async function shutdown(
  exit: boolean = false,
  code?: number,
): Promise<void> {
  logger.info({ code }, '✘ Server shutdown');
  server.close();

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

export async function start({
  graphQLServerOptions = {},
  withSignalHandlers = true,
  resolvers = [],
  port,
}: SuperServerOptions = {}): Promise<Server> {
  if (withSignalHandlers) setupSignalHandlers();
  if (
    _.isEmpty(resolvers) &&
    _.isEmpty(_.get(graphQLServerOptions, 'buildSchemaOptions.resolvers'))
  ) {
    throw new Error('Missing resolvers');
  }

  await configure(app, {
    ...graphQLServerOptions,
    buildSchemaOptions: {
      ...graphQLServerOptions.buildSchemaOptions,
      resolvers: [
        ..._.get(graphQLServerOptions, 'buildSchemaOptions.resolvers', []),
        ...resolvers,
      ],
    },
  });
  server.listen(port || config.port);
  logger.info(
    { port: config.port, environment: config.environment },
    '✓ Server started successfully',
  );
  return server;
}
