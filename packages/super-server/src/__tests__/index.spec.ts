import { Server } from 'http';

import _ from 'lodash';
import request from 'supertest';
import { Arg, Query, Resolver } from 'type-graphql';

import * as server from '../index';
import { SuperServerPlugin } from '../index';

@Resolver()
class GreetingResolver {
  @Query(() => String)
  public hello(@Arg('name') name: string): string {
    return `Hello ${name}`;
  }
}

describe('Super server 🚀', () => {
  let serverInstance: Server;
  let dummyPlugin: SuperServerPlugin;

  beforeEach(() => {
    dummyPlugin = {
      setup: jest.fn(),
      configure: jest.fn(),
      updateGraphQLServerOptions: jest.fn().mockImplementation(_.identity),
      tearDown: jest.fn(),
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
    if (serverInstance) serverInstance.close();
  });

  describe('#start', () => {
    it('should start the server with a resolver', async () => {
      serverInstance = await server.start({
        withSignalHandlers: false,
        resolvers: [GreetingResolver],
        plugins: [dummyPlugin],
      });

      const { status, body } = await request(serverInstance).get('/status');
      expect({ status, body }).toMatchInlineSnapshot(`
                                                                Object {
                                                                  "body": Object {},
                                                                  "status": 200,
                                                                }
                                                `);

      expect(dummyPlugin.setup).toHaveBeenCalledTimes(1);
      expect(dummyPlugin.configure).toHaveBeenCalledTimes(1);
      expect(dummyPlugin.updateGraphQLServerOptions).toHaveBeenCalledTimes(1);
      expect(dummyPlugin.tearDown).not.toHaveBeenCalled();
    });

    it('should start the server and setup signal handlers', async () => {
      const processOnSpy = jest
        .spyOn(process, 'on')
        .mockImplementation(_.noop as typeof process.on);
      serverInstance = await server.start({
        withSignalHandlers: true,
        resolvers: [GreetingResolver],
      });

      expect(processOnSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle malformed graphql requests', async () => {
      serverInstance = await server.start({
        withSignalHandlers: false,
        resolvers: [GreetingResolver],
      });

      const { status, body } = await request(serverInstance)
        .post('/graphql')
        .send({
          query: `
            query {
              hello
            }
        `,
        });
      expect({ status, body }).toMatchInlineSnapshot(`
                                Object {
                                  "body": Object {
                                    "errors": Array [
                                      Object {
                                        "locations": Array [
                                          Object {
                                            "column": 15,
                                            "line": 3,
                                          },
                                        ],
                                        "message": "Field \\"hello\\" argument \\"name\\" of type \\"String!\\" is required, but it was not provided.",
                                      },
                                    ],
                                  },
                                  "status": 400,
                                }
                        `);
    });

    it('should handle successfully graphql requests', async () => {
      serverInstance = await server.start({
        withSignalHandlers: false,
        resolvers: [GreetingResolver],
      });

      const { status, body } = await request(serverInstance)
        .post('/graphql')
        .send({
          query: `
            query {
              hello(name: "John")
            }
        `,
        });
      expect({ status, body }).toMatchInlineSnapshot(`
                                        Object {
                                          "body": Object {
                                            "data": Object {
                                              "hello": "Hello John",
                                            },
                                          },
                                          "status": 200,
                                        }
                              `);
    });
  });

  describe('#shutdown', () => {
    it('should shutdown a started server successfully', async () => {
      const processExitSpy = jest
        .spyOn(process, 'exit')
        .mockImplementation(_.noop as typeof process.exit);
      serverInstance = await server.start({
        resolvers: [GreetingResolver],
        plugins: [dummyPlugin],
      });
      const closeSpy = jest.spyOn(serverInstance, 'close');

      await server.shutdown(true);

      expect(dummyPlugin.tearDown).toHaveBeenCalledTimes(1);
      expect(closeSpy).toHaveBeenCalledTimes(1);
      expect(processExitSpy).toMatchInlineSnapshot(`
                [MockFunction] {
                  "calls": Array [
                    Array [
                      0,
                    ],
                  ],
                  "results": Array [
                    Object {
                      "type": "return",
                      "value": undefined,
                    },
                  ],
                }
            `);
    });
  });

  describe('#getExpressApp', () => {
    it('should return the express app', () => {
      expect(server.getExpressApp()).toBeDefined();
    });
  });
});
