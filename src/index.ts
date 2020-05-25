import type { Express } from 'express';
import passport from 'passport';
import { Resolver, SuperServerPlugin } from './typings';
import AuthenticationResolver from './resolver/authentication';

class SuperServerAuthCorePlugin implements SuperServerPlugin {
  async configure(app: Express): Promise<void> {
    app.use(passport.initialize());
  }

  getResolvers(): Resolver[] {
    return [AuthenticationResolver];
  }

  async setup(): Promise<void> {
    // Nothing
  }
}

export default new SuperServerAuthCorePlugin();
