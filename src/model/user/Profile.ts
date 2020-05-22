import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export default class Profile {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => [String])
  roles: string[];

  @Field()
  iat?: number;

  @Field()
  exp?: number;
}
