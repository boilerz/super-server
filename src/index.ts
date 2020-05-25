import type { Express } from 'express';
import passport from 'passport';
import { Resolver, SuperServerPlugin } from './typings';
import AuthenticationResolver from './resolver/authentication';

const plugin: SuperServerPlugin = {
  async configure(app: Express): Promise<void> {
    app.use(passport.initialize());
  },

  getResolvers(): Resolver[] {
    return [AuthenticationResolver];
  },

  async setup(): Promise<void> {
    // Noop
  },

  async tearDown(): Promise<void> {
    // Noop
  },
};

export default plugin;
