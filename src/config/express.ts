import * as Sentry from '@sentry/node';
import bodyParser from 'body-parser';
import { Express, Request, Response } from 'express';

import { GraphQLServerOptions, setupGraphQLServer } from '../graphql';
import sslRedirect from '../middleware/sslRedirect';
import { SuperServerPlugin } from '../typings';

export default async function configure(
  app: Express,
  graphQLServerOptions: GraphQLServerOptions,
  plugins: SuperServerPlugin[] = [],
): Promise<void> {
  app.use(Sentry.Handlers.requestHandler());
  app.enable('trust proxy');
  app.use(bodyParser.json());
  app.use(sslRedirect);
  app.get(
    '/status',
    (req: Request, res: Response): Response => res.sendStatus(200),
  );

  // Plugins configuration
  for (const plugin of plugins) {
    await plugin.configure(app, graphQLServerOptions);
  }

  await setupGraphQLServer(app, graphQLServerOptions);
  app.use(Sentry.Handlers.errorHandler());
}
