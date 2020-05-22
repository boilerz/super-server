import { InputType, Field } from 'type-graphql';
import { Length } from 'class-validator';

@InputType()
export default class UserInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  @Length(8, 60)
  password: string;
}
