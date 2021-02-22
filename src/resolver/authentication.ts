import { OAuth2Client } from 'google-auth-library';
import { Arg, Query, Resolver } from 'type-graphql';

import logger from '@boilerz/logger';
import { ExternalProvider } from '@boilerz/super-server-auth-core/model/user/ExternalProviderAccount';
import * as authenticationService from '@boilerz/super-server-auth-core/service/authentication';

import config from '../config';
import VerifyIDTokenResponse from '../model/VerifyIDTokenResponse';

export const auth2Client = new OAuth2Client(config.google.clientID);

const ALLOWED_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

@Resolver()
class GoogleAuthenticationResolver {
  @Query(() => VerifyIDTokenResponse, { nullable: true })
  async verifyGoogleIdToken(
    @Arg('idToken') idToken: string,
  ): Promise<VerifyIDTokenResponse> {
    let payload;
    try {
      const ticket = await auth2Client.verifyIdToken({
        idToken,
        audience: config.google.clientID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      payload = null;
    }
    if (!payload) throw new Error('Invalid token');

    const defaultName = payload.name || '';
    const {
      aud,
      iss,
      exp,
      email,
      email_verified: emailVerified,
      given_name: firstName = defaultName,
      family_name: lastName = defaultName,
      sub: id,
    } = payload;
    if (aud !== config.google.clientID) throw new Error('Incorrect client id');
    if (!ALLOWED_ISSUERS.includes(iss)) throw new Error('Incorrect issuers');
    if (exp * 1000 - Date.now() < 0) throw new Error('ID Token expired');
    if (!email || !emailVerified) {
      logger.warn(
        { email, emailVerified },
        '[verifyGoogleIdToken] Email not verified, should not happen',
      );
      throw new Error('Missing verified email');
    }

    const userOrLinkCode = await authenticationService.continueWith(
      { email, firstName, lastName },
      ExternalProvider.GOOGLE,
      {
        id,
        data: (payload as unknown) as Record<string, unknown>,
      },
    );

    if (typeof userOrLinkCode === 'string') {
      return {
        linkAccount: true,
      };
    }

    return {
      token: authenticationService.signToken(userOrLinkCode),
    };
  }
}

export default GoogleAuthenticationResolver;
