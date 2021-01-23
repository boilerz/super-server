import {
  OAuth2Strategy as GoogleStrategy,
  Profile,
  VerifyFunction,
} from 'passport-google-oauth';
import * as authenticationService from '@boilerz/super-server-auth-core/service/authentication';
import { ExternalProvider } from '@boilerz/super-server-auth-core/model/user/ExternalProviderAccount';
import config from './config';

export const LINK_REQUEST_ACTION = 'LINK_REQUEST';

export interface GoogleProfile extends Profile {
  emails?: Array<{
    value: string;
    type?: string;
    verified?: boolean;
  }>;
}

export interface LinkRequestOption {
  action: 'LINK_REQUEST';
  email: string;
}

interface LinkRequestFunction {
  (error: null, user?: true, opts?: LinkRequestOption): void;
}

export async function verify(
  accessToken: string,
  refreshToken: string,
  profile: GoogleProfile,
  done: VerifyFunction,
): Promise<void> {
  if (
    !profile.emails ||
    profile.emails?.length === 0 ||
    profile.emails[0].verified === false
  ) {
    return done(new Error('Missing verified profile email'));
  }

  const {
    emails: [{ value: email }],
    _json: googleData,
  } = profile;
  const userOrLinkCode = await authenticationService.continueWith(
    {
      email,
      firstName: profile.name?.givenName || profile.displayName,
      lastName: profile.name?.familyName || profile.displayName,
    },
    ExternalProvider.GOOGLE,
    {
      id: profile.id,
      data: googleData,
    },
  );

  if (typeof userOrLinkCode === 'string') {
    return (done as LinkRequestFunction)(null, true, {
      action: LINK_REQUEST_ACTION,
      email,
    });
  }

  return done(null, userOrLinkCode);
}

const googleStrategy = new GoogleStrategy(
  {
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: `${config.host}/auth/google/callback`,
  },
  verify,
);
export default googleStrategy;
