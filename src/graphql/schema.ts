import { GraphQLSchema } from 'graphql';
import { buildSchema, BuildSchemaOptions } from 'type-graphql';

export function build(options: BuildSchemaOptions): Promise<GraphQLSchema> {
  return buildSchema({
    ...options,
  });
}
