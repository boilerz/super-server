import type { Express } from 'express';
import passport from 'passport';
import plugin from '../index';

describe('Plugin', () => {
  describe('#setup', () => {
    it('should setup the plugin', () => {
      const passportUseSpy = jest.spyOn(passport, 'use');

      plugin.setup();

      expect(passportUseSpy).toHaveBeenCalled();
    });
  });

  describe('#configure', () => {
    it('should configure the authentication strategy', () => {
      // @ts-ignore mock
      const app: Express = {
        post: jest.fn(),
      };

      plugin.configure(app);

      expect(app.post).toHaveBeenCalled();
    });
  });

  describe('#getResolvers', () => {
    it('should return plugin resolvers', () => {
      expect(plugin.getResolvers()).toEqual([]);
    });
  });
});
