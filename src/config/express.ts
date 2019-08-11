import * as Sentry from '@sentry/node';
import { Express, Request, Response } from 'express';

import { GraphQLServerOptions, setupGraphQLServer } from '../graphql';

import sslRedirect from '../middleware/sslRedirect';

export default async function configure(
  app: Express,
  graphQLServerOptions: GraphQLServerOptions,
): Promise<void> {
  app.use(Sentry.Handlers.requestHandler());
  app.enable('trust proxy');
  app.use(sslRedirect);
  app.get(
    '/status',
    (req: Request, res: Response): Response => res.sendStatus(200),
  );
  await setupGraphQLServer(app, graphQLServerOptions);
  app.use(Sentry.Handlers.errorHandler());
}
