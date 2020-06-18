import * as mongooseHelper from '@boilerz/mongoose-helper';
import * as superServer from '@boilerz/super-server';
import { Query, Resolver } from 'type-graphql';
import request from 'supertest';
import { Server } from 'http';

import * as emailHelper from '../../helper/email';
import plugin from '../../index';

// https://graphql.github.io/graphql-spec/June2018/#sec-Schema
@Resolver()
class DummyResolver {
  @Query(() => String)
  dummyMandatoryQuery(): string {
    return 'Yo';
  }
}

describe('AuthenticationResolver', () => {
  let server: Server;

  beforeAll(async () => {
    await mongooseHelper.connect(undefined, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    await mongooseHelper.dropDatabase();
    server = await superServer.start({
      plugins: [plugin],
      resolvers: [DummyResolver],
      port: 5000,
    });
  });

  afterAll(async () => {
    await mongooseHelper.disconnect();
    await superServer.shutdown();
  });

  it('should handle sign up', async () => {
    const publishSpy = jest
      .spyOn(emailHelper.getPublisherClient(), 'publish')
      .mockResolvedValue();

    const query = `
      mutation {
        signUp(
          userInput: {
            firstName: "Johny"
            lastName: "Boy"
            email: "johny@boy.fr"
            password: "password"
          }
        ) {
          firstName
          roles
        }
      }
    `;
    const { body: firstResponse } = await request(server)
      .post('/graphql')
      .send({ query });

    expect(firstResponse).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "signUp": Object {
            "firstName": "Johny",
            "roles": Array [
              "user",
            ],
          },
        },
      }
    `);

    expect(publishSpy).toHaveBeenCalledWith({
      email: 'johny@boy.fr',
      firstName: 'Johny',
      lastName: 'Boy',
      validationCode: expect.any(String),
    });

    const { body: secondResponse } = await request(server)
      .post('/graphql')
      .send({ query });

    expect(secondResponse).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "signUp": null,
        },
        "errors": Array [
          Object {
            "locations": Array [
              Object {
                "column": 9,
                "line": 3,
              },
            ],
            "message": "UserSchema validation failed: email: user:validator.emailInUse",
            "path": Array [
              "signUp",
            ],
          },
        ],
      }
    `);
  });
});
