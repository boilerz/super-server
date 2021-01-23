import { Field, ObjectType } from 'type-graphql';

@ObjectType()
class VerifyIDTokenResponse {
  @Field({ defaultValue: false })
  linkAccount?: boolean;

  @Field({ nullable: true, defaultValue: null })
  token?: string;
}

export default VerifyIDTokenResponse;
