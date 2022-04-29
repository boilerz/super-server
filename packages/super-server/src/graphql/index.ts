import 'reflect-metadata';
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import { Express } from 'express';
import { GraphQLSchema } from 'graphql';
import { BuildSchemaOptions } from 'type-graphql';

import config from '../config';
import { formatError } from './helper';
import { build as buildSchema } from './schema';

export interface GraphQLServerOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
  buildSchemaOptions: BuildSchemaOptions;
  apolloServerExpressConfig?: ApolloServerExpressConfig;
}

export async function setupGraphQLServer(
  app: Express,
  {
    context,
    buildSchemaOptions,
    apolloServerExpressConfig,
  }: GraphQLServerOptions,
): Promise<ApolloServer> {
  const schema: GraphQLSchema = await buildSchema(buildSchemaOptions);
  const server: ApolloServer = new ApolloServer({
    schema,
    formatError,
    context,
    ...apolloServerExpressConfig,
  });

  await server.start();

  server.applyMiddleware({
    app,
    cors: {
      credentials: true,
      origin: config.cors.allowedDomains,
    },
  });
  return server;
}
