import { ApolloServerExpressConfig } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { Express } from 'express';
import { BuildSchemaOptions } from 'type-graphql';

export interface GraphQLServerOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
  buildSchemaOptions: BuildSchemaOptions;
  apolloServerExpressConfig?: ApolloServerExpressConfig;
}

export type Resolver<T extends Function | string = Function> = T;

export interface SuperServerPlugin<ProducedContext = object> {
  setup(): Promise<void>;
  /** Options are updated before the `configure` call */
  updateGraphQLServerOptions?(
    options: GraphQLServerOptions,
  ): GraphQLServerOptions;
  configure(
    app: Express,
    graphQLServerOptions: GraphQLServerOptions,
  ): Promise<void>;
  buildContext?(
    context: ExpressContext,
  ): ProducedContext | Promise<ProducedContext>;
  tearDown(): Promise<void>;
}
