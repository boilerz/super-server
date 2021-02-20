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

type Unpacked<T> = T extends (infer U)[] ? U : T;
export type Resolver = Unpacked<BuildSchemaOptions['resolvers']>;

export interface SuperServerPlugin<ProducedContext = Record<string, unknown>> {
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
