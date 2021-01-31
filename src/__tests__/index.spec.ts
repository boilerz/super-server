import type { Express } from 'express';
import passport from 'passport';

import { GraphQLServerOptions } from '@boilerz/super-server/typings';

import plugin from '../index';
import strategy from '../strategy';
import DummyResolver from './__fixtures/DummyResolver';

describe('Plugin', () => {
  const graphQLServerOptions: GraphQLServerOptions = Object.freeze({
    buildSchemaOptions: { resolvers: [DummyResolver] },
  });

  describe('#configure', () => {
    it('should configure express', async () => {
      const expressMock: Express = ({
        get: jest.fn(),
      } as unknown) as Express;
      await plugin.configure(expressMock, graphQLServerOptions);

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
      expect(
        plugin.updateGraphQLServerOptions!(graphQLServerOptions),
      ).toMatchInlineSnapshot(
        {},
        `
        Object {
          "buildSchemaOptions": Object {
            "resolvers": Array [
              [Function],
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
