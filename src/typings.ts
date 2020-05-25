import { Express } from 'express';
import { BuildSchemaOptions } from 'type-graphql';
import { ApolloServerExpressConfig } from 'apollo-server-express';

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
  tearDown(): Promise<void>;
}
