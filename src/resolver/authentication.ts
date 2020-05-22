import { Arg, Mutation, Resolver } from 'type-graphql';
import User from '../model/user/User';
import UserInput from '../model/user/UserInput';
import * as authenticationService from '../service/authentication';

@Resolver(User)
class AuthenticationResolver {
  @Mutation(() => User, { nullable: true })
  async signUp(@Arg('userInput') userInput: UserInput): Promise<User> {
    return authenticationService.signUp(userInput);
  }
}

export default AuthenticationResolver;
