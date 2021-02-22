import { Server } from 'http';

import { ObjectID } from 'bson';
import dayjs from 'dayjs';
import request from 'supertest';
import { Authorized, Query, Resolver } from 'type-graphql';

import * as mongooseHelper from '@boilerz/mongoose-helper';
import * as superServer from '@boilerz/super-server';
import { SuperServerPlugin } from '@boilerz/super-server';

import Role from '../../enum/Role';
import * as emailHelper from '../../helper/email';
import plugin from '../../index';
import { ExternalProvider } from '../../model/user/ExternalProviderAccount';
import User from '../../model/user/User';
import UserModel from '../../model/user/UserModel';
import * as authenticationService from '../../service/authentication';

// https://graphql.github.io/graphql-spec/June2018/#sec-Schema
@Resolver()
class DummyResolver {
  @Query(() => String)
  dummyMandatoryQuery(): string {
    return 'Yo';
  }

  @Authorized(Role.ADMIN)
  @Query(() => String)
  authenticatedQuery(): string {
    return 'Authenticated yo';
  }
}

describe('AuthenticationResolver', () => {
  let server: Server;
  let publishSpy: jest.SpyInstance;
  const johnDoe = Object.freeze({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.co',
  });
  const johnDoeUserInput = Object.freeze({
    ...johnDoe,
    password: 'passw0rd',
  });
  let johnDoeUser: User;

  beforeAll(async () => {
    await mongooseHelper.connect(undefined, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    server = await superServer.start({
      plugins: [(plugin as unknown) as SuperServerPlugin],
      resolvers: [DummyResolver],
      port: 5000,
    });
  });
  beforeEach(async () => {
    await mongooseHelper.dropDatabase();
    johnDoeUser = Object.assign(new User(), {
      _id: ObjectID.createFromTime(0),
      ...johnDoeUserInput,
      createdAt: new Date(),
      documentVersion: 0,
      roles: [Role.USER],
    });
    publishSpy = jest
      .spyOn(emailHelper.getPublisherClient(), 'publish')
      .mockResolvedValue();
  });

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

    expect(publishSpy).toHaveBeenCalledWith(
      {
        email: 'johny@boy.fr',
        firstName: 'Johny',
        lastName: 'Boy',
        validationCode: expect.any(String),
      },
      'emailValidation',
    );

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
    await authenticationService.localSignUp(johnDoeUserInput);
    const user = await UserModel.findOne({ email: johnDoeUserInput.email });
    await UserModel.updateOne(
      { email: johnDoeUserInput.email },
      {
        'provider.local.emailValidationCodeExpirationDate': dayjs()
          .subtract(24, 'hour')
          .toDate(),
      },
    );

    const query = `
      mutation {
        validateEmail(
          email: "john@doe.co",
          validationCode: "${user?.provider.local.emailValidationCode}"
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
    await authenticationService.localSignUp(johnDoeUserInput);
    const user = await UserModel.findOne({
      email: 'john@doe.co',
    });

    const query = `
      mutation {
        validateEmail(
          email: "john@doe.co",
          validationCode: "${user?.provider.local.emailValidationCode}"
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

  it('should fail to link an unknown email / provider / linkCode triple', async () => {
    const query = `
      mutation {
        linkProvider(
          email: "john@doe.co",
          provider: GOOGLE,
          linkCode: "15"
        )
      }
    `;
    const { body } = await request(server).post('/graphql').send({ query });

    expect(body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "linkProvider": false,
        },
      }
    `);
  });

  it('should fail to link a provider with an expired validation code', async () => {
    await authenticationService.continueWith(johnDoe, ExternalProvider.GOOGLE, {
      id: '15',
      data: {
        extra: 'things',
      },
    });
    const user = await UserModel.findOne({ email: johnDoe.email });
    await UserModel.updateOne(
      { email: johnDoeUserInput.email },
      {
        'provider.google.linkCodeExpirationDate': dayjs()
          .subtract(24, 'hour')
          .toDate(),
      },
    );

    const query = `
      mutation {
        linkProvider(
          email: "john@doe.co",
          provider: GOOGLE,
          linkCode: "${user?.provider.google.linkCode}"
        )
      }
    `;
    const { body } = await request(server).post('/graphql').send({ query });

    expect(body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "linkProvider": false,
        },
      }
    `);
  });

  it('should successfully link an external provider', async () => {
    await authenticationService.localSignUp(johnDoeUserInput);
    await authenticationService.continueWith(johnDoe, ExternalProvider.GOOGLE, {
      id: '15',
      data: {
        extra: 'things',
      },
    });
    const user = await UserModel.findOne({
      email: 'john@doe.co',
    });

    const query = `
      mutation {
        linkProvider(
          email: "john@doe.co",
          provider: GOOGLE,
          linkCode: "${user?.provider.google.linkCode}"
        )
      }
    `;
    const { body } = await request(server).post('/graphql').send({ query });

    expect(body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "linkProvider": true,
        },
      }
    `);
  });

  it('should fail to query an authenticated query without credentials', async () => {
    const query = `
      query {
        authenticatedQuery
      }
    `;
    const { body } = await request(server).post('/graphql').send({ query });

    expect(body).toMatchInlineSnapshot(`
      Object {
        "data": null,
        "errors": Array [
          Object {
            "locations": Array [
              Object {
                "column": 9,
                "line": 3,
              },
            ],
            "message": "Access denied! You don't have permission for this action!",
            "path": Array [
              "authenticatedQuery",
            ],
          },
        ],
      }
    `);
  });

  it('should fail to query an authenticated query with expired credentials', async () => {
    const query = `
      query {
        authenticatedQuery
      }
    `;
    const { body } = await request(server)
      .post('/graphql')
      .set(
        'Authorization',
        `Bearer ${authenticationService.signToken(
          Object.assign(johnDoeUser, {
            roles: [Role.ADMIN],
          }),
          {
            expiresIn: -5000,
          },
        )}`,
      )
      .send({ query });

    expect(body).toMatchInlineSnapshot(`
      Object {
        "data": null,
        "errors": Array [
          Object {
            "locations": Array [
              Object {
                "column": 9,
                "line": 3,
              },
            ],
            "message": "Access denied! You don't have permission for this action!",
            "path": Array [
              "authenticatedQuery",
            ],
          },
        ],
      }
    `);
  });

  it('should fail to query an authenticated query without appropriate role credentials', async () => {
    const query = `
      query {
        authenticatedQuery
      }
    `;
    const { body } = await request(server)
      .post('/graphql')
      .set(
        'Authorization',
        `Bearer ${authenticationService.signToken(johnDoeUser)}`,
      )
      .send({ query });

    expect(body).toMatchInlineSnapshot(`
      Object {
        "data": null,
        "errors": Array [
          Object {
            "locations": Array [
              Object {
                "column": 9,
                "line": 3,
              },
            ],
            "message": "Access denied! You don't have permission for this action!",
            "path": Array [
              "authenticatedQuery",
            ],
          },
        ],
      }
    `);
  });

  it('should successfully query an authenticated query with valid credentials', async () => {
    const query = `
      query {
        authenticatedQuery
      }
    `;
    const { body } = await request(server)
      .post('/graphql')
      .set(
        'Authorization',
        `Bearer ${authenticationService.signToken(
          Object.assign(johnDoeUser, {
            roles: [Role.ADMIN],
          }),
        )}`,
      )
      .send({ query });

    expect(body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "authenticatedQuery": "Authenticated yo",
        },
      }
    `);
  });
});
