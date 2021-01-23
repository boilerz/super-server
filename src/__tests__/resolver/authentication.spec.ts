import { Server } from 'http';

import dayjs from 'dayjs';
import { LoginTicket, TokenPayload } from 'google-auth-library';
import request from 'supertest';

import * as mongooseHelper from '@boilerz/mongoose-helper';
import * as superServer from '@boilerz/super-server';
import authCorePlugin from '@boilerz/super-server-auth-core';
import * as emailHelper from '@boilerz/super-server-auth-core/helper/email';
import { ExternalProvider } from '@boilerz/super-server-auth-core/model/user/ExternalProviderAccount';
import { continueWith } from '@boilerz/super-server-auth-core/service/authentication';
import mongoPlugin from '@boilerz/super-server-mongo';

import plugin from '../../index';
import { auth2Client } from '../../resolver/authentication';
import { johnDoe } from '../__fixtures/profiles';
import { johnDoe as johnDoeTokenPayload } from '../__fixtures/tokenPayloads';

function mockVerifyIdToken(tokenPayload: TokenPayload): void {
  jest
    .spyOn(auth2Client, 'verifyIdToken')
    // @ts-ignore
    .mockResolvedValue(new LoginTicket('', tokenPayload));
}

describe('AuthenticationResolver', () => {
  let server: Server;

  beforeAll(async () => {
    server = await superServer.start({
      plugins: [mongoPlugin, authCorePlugin, plugin],
      port: 5000,
    });
  });
  beforeEach(async () => {
    await mongooseHelper.dropDatabase();
    jest.spyOn(emailHelper.getPublisherClient(), 'publish').mockResolvedValue();
  });

  afterAll(async () => {
    await mongooseHelper.disconnect();
    await superServer.shutdown();
  });

  it('should fail to verify a dummy token', async () => {
    const query = `
      query {
        verifyGoogleIdToken(idToken: "dummy.id.token") {
          linkAccount
          token
        }
      }
    `;
    const { body } = await request(server).post('/graphql').send({ query });

    expect(body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "verifyGoogleIdToken": null,
        },
        "errors": Array [
          Object {
            "locations": Array [
              Object {
                "column": 9,
                "line": 3,
              },
            ],
            "message": "Invalid token",
            "path": Array [
              "verifyGoogleIdToken",
            ],
          },
        ],
      }
    `);
  });

  it('should fail to verify a token with an invalid audience', async () => {
    mockVerifyIdToken({
      ...johnDoeTokenPayload,
      aud: 'invalid.audience',
    });
    const query = `
      query {
        verifyGoogleIdToken(idToken: "some.valid.token") {
          linkAccount
          token
        }
      }
    `;
    const { body } = await request(server).post('/graphql').send({ query });

    expect(body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "verifyGoogleIdToken": null,
        },
        "errors": Array [
          Object {
            "locations": Array [
              Object {
                "column": 9,
                "line": 3,
              },
            ],
            "message": "Incorrect client id",
            "path": Array [
              "verifyGoogleIdToken",
            ],
          },
        ],
      }
    `);
  });

  it('should fail to verify a token with an incorrect issuer', async () => {
    mockVerifyIdToken({
      ...johnDoeTokenPayload,
      iss: 'http://yolo.co',
    });
    const query = `
      query {
        verifyGoogleIdToken(idToken: "some.valid.token") {
          linkAccount
          token
        }
      }
    `;
    const { body } = await request(server).post('/graphql').send({ query });

    expect(body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "verifyGoogleIdToken": null,
        },
        "errors": Array [
          Object {
            "locations": Array [
              Object {
                "column": 9,
                "line": 3,
              },
            ],
            "message": "Incorrect issuers",
            "path": Array [
              "verifyGoogleIdToken",
            ],
          },
        ],
      }
    `);
  });

  it('should fail to verify an expired id token', async () => {
    mockVerifyIdToken({
      ...johnDoeTokenPayload,
      exp: dayjs(0).unix(),
    });
    const query = `
      query {
        verifyGoogleIdToken(idToken: "some.valid.token") {
          linkAccount
          token
        }
      }
    `;
    const { body } = await request(server).post('/graphql').send({ query });

    expect(body).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "verifyGoogleIdToken": null,
        },
        "errors": Array [
          Object {
            "locations": Array [
              Object {
                "column": 9,
                "line": 3,
              },
            ],
            "message": "ID Token expired",
            "path": Array [
              "verifyGoogleIdToken",
            ],
          },
        ],
      }
    `);
  });

  it('should ask to link the account for an existing user', async () => {
    await continueWith(
      {
        email: johnDoe.emails![0].value,
        firstName: johnDoe.name!.givenName,
        lastName: johnDoe.name!.familyName,
      },
      ExternalProvider.GITHUB,
      { id: johnDoe.id, data: {} },
    );
    mockVerifyIdToken(johnDoeTokenPayload);
    const query = `
      query {
        verifyGoogleIdToken(idToken: "some.valid.token") {
          linkAccount
          token
        }
      }
    `;
    const { body } = await request(server).post('/graphql').send({ query });

    expect(body).toEqual({
      data: {
        verifyGoogleIdToken: {
          linkAccount: true,
          token: null,
        },
      },
    });
  });

  it('should verify a valid token for a fresh user', async () => {
    mockVerifyIdToken(johnDoeTokenPayload);
    const query = `
      query {
        verifyGoogleIdToken(idToken: "some.valid.token") {
          linkAccount
          token
        }
      }
    `;
    const { body } = await request(server).post('/graphql').send({ query });

    expect(body).toEqual({
      data: {
        verifyGoogleIdToken: {
          linkAccount: null,
          token: expect.any(String),
        },
      },
    });
  });
});
