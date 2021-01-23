import passport from 'passport';
import dayjs from 'dayjs';
import * as authenticationService from '@boilerz/super-server-auth-core/service/authentication';
import User from '@boilerz/super-server-auth-core/model/user/User';
import type { CookieOptions, Express, Request, Response } from 'express';
import { LINK_REQUEST_ACTION, LinkRequestOption } from '../strategy';
import config from '.';

const linkEmailCookieOption: CookieOptions = {
  encode: (email: string): string => email,
};

export function callbackHandler(req: Request, res: Response): void | Response {
  const linkRequestOption = req.authInfo as LinkRequestOption;
  if (linkRequestOption.action === LINK_REQUEST_ACTION) {
    res.cookie('linkEmail', linkRequestOption.email, {
      ...linkEmailCookieOption,
      expires: dayjs().add(1, 'day').toDate(),
    });
    return res.redirect(config.linkProviderCallbackURL);
  }

  if (!req.user) {
    return res.sendStatus(401);
  }

  res.cookie('jwt', authenticationService.signToken(req.user as User));
  return res.redirect('/');
}

async function configure(app: Express): Promise<void> {
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: config.google.scope,
    }),
  );

  app.get(
    '/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: config.failureRedirect,
      session: false,
    }),
    callbackHandler,
  );
}
export default configure;
