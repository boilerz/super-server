import { Arg, Query, Resolver } from 'type-graphql';
import { Server } from 'http';
import request from 'supertest';
import _ from 'lodash';

import * as server from '../index';

@Resolver()
class GreetingResolver {
  @Query(() => String)
  public hello(@Arg('name') name: string): string {
    return `Hello ${name}`;
  }
}

describe('Super server 🚀', () => {
  let serverInstance: Server;

  afterEach(() => {
    jest.clearAllMocks();
    if (serverInstance) serverInstance.close();
  });

  describe('#start', () => {
    it('should fail to start the server without resolvers', async () => {
      return expect(server.start()).rejects.toMatchInlineSnapshot(
        `[Error: Missing resolvers]`,
      );
    });

    it('should start the server with a resolver', async () => {
      serverInstance = await server.start({
        withSignalHandlers: false,
        resolvers: [GreetingResolver],
      });

      const { status, body } = await request(serverInstance).get('/status');
      expect({ status, body }).toMatchInlineSnapshot(`
                                                                Object {
                                                                  "body": Object {},
                                                                  "status": 200,
                                                                }
                                                `);
    });

    it('should start the server and setup signal handlers', async () => {
      // @ts-ignore
      const processOnSpy = jest.spyOn(process, 'on').mockImplementation(_.noop);
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
        // @ts-ignore
        .mockImplementation(_.noop);
      serverInstance = await server.start({
        resolvers: [GreetingResolver],
      });
      const closeSpy = jest.spyOn(serverInstance, 'close');

      await server.shutdown(true);

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
});
