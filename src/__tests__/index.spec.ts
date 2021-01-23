import { Server } from 'http';

import request from 'supertest';
import { Arg, Query, Resolver } from 'type-graphql';

import * as mongooseHelper from '@boilerz/mongoose-helper';
import * as superServer from '@boilerz/super-server';
import authCorePlugin from '@boilerz/super-server-auth-core';
import { ExternalProvider } from '@boilerz/super-server-auth-core/model/user/ExternalProviderAccount';
import UserModel from '@boilerz/super-server-auth-core/model/user/UserModel';
import * as authenticationService from '@boilerz/super-server-auth-core/service/authentication';
import mongoPlugin from '@boilerz/super-server-mongo';

import plugin from '../index';

@Resolver()
class GreetingResolver {
  @Query(() => String)
  public hello(@Arg('name') name: string): string {
    return `Hello ${name}`;
  }
}

describe('Plugin', () => {
  let server: Server;
  const johnDoe = Object.freeze({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.co',
  });

  beforeAll(async () => {
    await mongooseHelper.connect(undefined, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    server = await superServer.start({
      plugins: [mongoPlugin, authCorePlugin, plugin],
      resolvers: [GreetingResolver],
      port: 5000,
    });
  });

  beforeEach(async () => {
    await mongooseHelper.dropDatabase();
  });

  afterAll(async () => {
    await mongooseHelper.disconnect();
    await superServer.shutdown();
  });

  it('should fail to authenticated when any unknown error occurs', async () => {
    jest.spyOn(UserModel, 'findOne').mockRejectedValue(new Error('Unknown'));

    const { body, status } = await request(server)
      .post('/auth/local')
      .send({ email: johnDoe.email, password: 'password' });

    expect({ body, status }).toMatchInlineSnapshot(`
      Object {
        "body": Object {},
        "status": 401,
      }
    `);
  });

  it('should fail to authenticated with unknown user credentials', async () => {
    const { body, status } = await request(server)
      .post('/auth/local')
      .send({ email: johnDoe.email, password: 'password' });

    expect({ body, status }).toMatchInlineSnapshot(`
      Object {
        "body": Object {},
        "status": 401,
      }
    `);
  });

  it('should fail to authenticate an user with no local provider set', async () => {
    await authenticationService.continueWith(johnDoe, ExternalProvider.GOOGLE, {
      id: '42',
      data: {},
    });
    const { body, status } = await request(server)
      .post('/auth/local')
      .send({ email: johnDoe.email, password: 'password' });

    expect({ body, status }).toMatchInlineSnapshot(`
      Object {
        "body": Object {},
        "status": 401,
      }
    `);
  });

  it('should fail to authenticate an user with a bad password', async () => {
    await authenticationService.localSignUp({
      ...johnDoe,
      password: 'passw0rd',
    });
    const { body, status } = await request(server)
      .post('/auth/local')
      .send({ email: johnDoe.email, password: 'password' });

    expect({ body, status }).toMatchInlineSnapshot(`
      Object {
        "body": Object {},
        "status": 401,
      }
    `);
  });

  it('should fail to authenticate an non active local user', async () => {
    await authenticationService.localSignUp({
      ...johnDoe,
      password: 'passw0rd',
    });

    const { body, status } = await request(server)
      .post('/auth/local')
      .send({ email: johnDoe.email, password: 'passw0rd' });

    expect({ body, status }).toMatchInlineSnapshot(`
      Object {
        "body": Object {
          "code": "user.not.active",
        },
        "status": 401,
      }
    `);
  });

  it('should successfully authenticate an active local user', async () => {
    const { id: userId } = await authenticationService.localSignUp({
      ...johnDoe,
      password: 'passw0rd',
    });
    const user = (await UserModel.findById(userId))!;
    await authenticationService.validateEmail(
      user.email,
      user.provider.local.emailValidationCode,
    );

    const { body, status } = await request(server)
      .post('/auth/local')
      .send({ email: johnDoe.email, password: 'passw0rd' });

    expect({ body, status }).toEqual({
      body: {
        token: expect.any(String),
      },
      status: 200,
    });
  });
});
