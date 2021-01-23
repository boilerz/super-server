import type { Express } from 'express';
import passport from 'passport';

import plugin from '../index';
import strategy from '../strategy';

describe('Plugin', () => {
  describe('#configure', () => {
    it('should configure express', async () => {
      const expressMock: Express = ({
        get: jest.fn(),
      } as unknown) as Express;
      await plugin.configure(expressMock, {});

      expect(expressMock.get).toMatchInlineSnapshot(`
        [MockFunction] {
          "calls": Array [
            Array [
              "/auth/google",
              [Function],
            ],
            Array [
              "/auth/google/callback",
              [Function],
              [Function],
            ],
          ],
          "results": Array [
            Object {
              "type": "return",
              "value": undefined,
            },
            Object {
              "type": "return",
              "value": undefined,
            },
          ],
        }
      `);
    });

    it('should update graphql server options', () => {
      expect(plugin.updateGraphQLServerOptions!({})).toMatchInlineSnapshot(
        {},
        `
        Object {
          "buildSchemaOptions": Object {
            "resolvers": Array [
              [Function],
            ],
          },
        }
      `,
      );
    });

    it('should setup passport strategy', async () => {
      const useSpy = jest.spyOn(passport, 'use');
      await plugin.setup();

      expect(useSpy).toHaveBeenCalledWith(strategy);
    });
  });
});
