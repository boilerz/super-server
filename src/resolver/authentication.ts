import { Arg, Mutation, Resolver } from 'type-graphql';

import { ExternalProvider } from '../model/user/ExternalProviderAccount';
import User from '../model/user/User';
import UserInput from '../model/user/UserInput';
import * as authenticationService from '../service/authentication';

@Resolver(User)
class AuthenticationResolver {
  @Mutation(() => User, { nullable: true })
  async signUp(@Arg('userInput') userInput: UserInput): Promise<User> {
    return authenticationService.localSignUp(userInput);
  }

  @Mutation(() => Boolean)
  async validateEmail(
    @Arg('email') email: string,
    @Arg('validationCode') validationCode: string,
  ): Promise<boolean> {
    return authenticationService.validateEmail(email, validationCode);
  }

  @Mutation(() => Boolean)
  async linkProvider(
    @Arg('email') email: string,
    @Arg('provider', () => ExternalProvider)
    provider: ExternalProvider,
    @Arg('linkCode') validationCode: string,
  ): Promise<boolean> {
    return authenticationService.linkProvider(email, provider, validationCode);
  }
}

export default AuthenticationResolver;
