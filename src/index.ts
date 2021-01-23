import type { DocumentType } from '@typegoose/typegoose';
import type { Express } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import logger from '@boilerz/logger';
import type { SuperServerPlugin } from '@boilerz/super-server';
import User from '@boilerz/super-server-auth-core/model/user/User';
import UserModel, {
  UserSchema,
} from '@boilerz/super-server-auth-core/model/user/UserModel';
import * as authenticationService from '@boilerz/super-server-auth-core/service/authentication';

const plugin: SuperServerPlugin = {
  async configure(app: Express): Promise<void> {
    app.post('/auth/local', (req, res, next) => {
      passport.authenticate(
        'local',
        async (err: Error, user: UserSchema, info: object) => {
          if (err || !user) {
            logger.error(
              { err, info },
              '[super-server-auth-local] Authentication error',
            );
            res.sendStatus(401);
            return;
          }

          if (!user.provider.local || !user.provider.local.isActive) {
            res.status(401).send({ code: 'user.not.active' });
            return;
          }

          res.status(200).send({
            token: authenticationService.signToken(user),
          });
        },
      )(req, res, next);
    });
  },

  async setup(): Promise<void> {
    passport.use(
      new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        (email: string, password: string, done: Function) => {
          UserModel.findOne({ email })
            .then((user: DocumentType<UserSchema>) => {
              if (!user || !user.provider.local) return done(null, false);
              if (!user.provider.local.authenticate(password)) {
                return done(null, false);
              }

              return done(null, user.toObjectType(User));
            })
            .catch((err) => done(err));
        },
      ),
    );
  },

  async tearDown(): Promise<void> {
    // Noop
  },
};

export default plugin;
