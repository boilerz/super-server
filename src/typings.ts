// FIXME to remove after super-server next's release

import type { BuildSchemaOptions } from 'type-graphql';
import type { ApolloServerExpressConfig } from 'apollo-server-express';
import type { Express } from 'express';

export interface GraphQLServerOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
  buildSchemaOptions?: BuildSchemaOptions;
  apolloServerExpressConfig?: ApolloServerExpressConfig;
}

export type Resolver = Function | string;

export interface SuperServerPlugin {
  setup(): Promise<void>;
  configure(
    app: Express,
    graphQLServerOptions: GraphQLServerOptions,
  ): Promise<void>;
  getResolvers(): Resolver[];
}
