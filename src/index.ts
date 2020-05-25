import type { Express } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import logger from '@boilerz/logger';
import type { DocumentType } from '@typegoose/typegoose';
import type { Resolver, SuperServerPlugin } from '@boilerz/super-server';
import UserModel, {
  UserSchema,
} from '@boilerz/super-server-auth-core/model/user/UserModel';
import * as authenticationService from '@boilerz/super-server-auth-core/service/authentication';
import User from '@boilerz/super-server-auth-core/model/user/User';

const plugin: SuperServerPlugin = {
  async configure(app: Express): Promise<void> {
    app.post('/auth/local', (req, res, next) => {
      passport.authenticate('local', async (err, user, info) => {
        if (err || !user) {
          logger.error(
            { err, info },
            '[super-server-auth-local] Authentication error',
          );
          res.sendStatus(401);
          return;
        }

        res.status(200).send({
          token: authenticationService.signToken(user),
        });
      })(req, res, next);
    });
  },

  getResolvers(): Resolver[] {
    return [];
  },

  async setup(): Promise<void> {
    passport.use(
      new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        (email: string, password: string, done: Function) => {
          UserModel.findOne(
            { email },
            (err: Error, user: DocumentType<UserSchema>) => {
              if (err) return done(err);
              if (!user) return done(null, false);
              if (!user.authenticate(password)) return done(null, false);

              return done(null, user.toObjectType(User));
            },
          );
        },
      ),
    );
  },

  async tearDown(): Promise<void> {
    // Noop
  },
};

export default plugin;
