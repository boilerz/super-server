import * as mongooseHelper from '@boilerz/mongoose-helper';
import * as superServer from '@boilerz/super-server';
import { Query, Resolver } from 'type-graphql';
import request from 'supertest';
import { Server } from 'http';
import dayjs from 'dayjs';

import * as authenticationService from '../../service/authentication';
import * as emailHelper from '../../helper/email';
import plugin from '../../index';
import UserModel from '../../model/user/UserModel';

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
  let publishSpy: jest.SpyInstance;
  const userInput = {
    firstName: 'John',
    lastName: 'Doe',
    password: 'passw0rd',
    email: 'john@doe.co',
  };

  beforeAll(async () => {
    await mongooseHelper.connect(undefined, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    server = await superServer.start({
      plugins: [plugin],
      resolvers: [DummyResolver],
      port: 5000,
    });
    publishSpy = jest
      .spyOn(emailHelper.getPublisherClient(), 'publish')
      .mockResolvedValue();
  });
  beforeEach(() => mongooseHelper.dropDatabase());

  afterAll(async () => {
    await mongooseHelper.disconnect();
    await superServer.shutdown();
  });

  it('should handle sign up', async () => {
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

  it('should fail to validate an unknown email / validationCode couple', async () => {
    const query = `
      mutation {
        validateEmail(
          email: "john@doe.co",
          validationCode: "42"
        )
      }
    `;
    const { body } = await request(server).post('/graphql').send({ query });

    expect(body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "validateEmail": false,
        },
      }
    `);
  });

  it('should fail to validate with an expired validation code', async () => {
    await authenticationService.signUp(userInput);
    const user = await UserModel.findOne({ email: userInput.email });
    await UserModel.updateOne(
      { email: userInput.email },
      {
        emailValidationCodeExpirationDate: dayjs()
          .subtract(24, 'hour')
          .toDate(),
      },
    );

    const query = `
      mutation {
        validateEmail(
          email: "john@doe.co",
          validationCode: "${user?.emailValidationCode}"
        )
      }
    `;
    const { body } = await request(server).post('/graphql').send({ query });

    expect(body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "validateEmail": false,
        },
      }
    `);
  });

  it('should successfully validate user email', async () => {
    await authenticationService.signUp(userInput);
    const user = await UserModel.findOne({
      email: 'john@doe.co',
    });

    const query = `
      mutation {
        validateEmail(
          email: "john@doe.co",
          validationCode: "${user?.emailValidationCode}"
        )
      }
    `;
    const { body } = await request(server).post('/graphql').send({ query });

    expect(body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "validateEmail": true,
        },
      }
    `);
  });
});
