import { TokenPayload } from 'google-auth-library';
import dayjs from 'dayjs';
import { johnDoe as johnDoeProfile } from './profiles';
import config from '../../config';

export const johnDoe: TokenPayload = Object.freeze({
  ...johnDoeProfile,
  name: johnDoeProfile.displayName,
  email: johnDoeProfile.emails![0].value,
  email_verified: true,
  iss: 'https://accounts.google.com',
  sub: johnDoeProfile.id,
  aud: config.google.clientID,
  iat: dayjs('2020-01-01').unix(),
  exp: dayjs('2099-01-01').unix(),
});
