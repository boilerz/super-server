import type { Request, Response } from 'express';

import Role from '@boilerz/super-server-auth-core/enum/Role';
import User from '@boilerz/super-server-auth-core/model/user/User';

import { callbackHandler } from '../../config/express';
import { LinkRequestOption } from '../../strategy';

describe('config/express', () => {
  let request: Request;
  let response: Response;

  beforeEach(() => {
    request = {
      authInfo: {},
    } as Request;
    response = {
      cookie: jest.fn(),
      redirect: jest.fn(),
      sendStatus: jest.fn(),
    } as unknown as Response;
  });

  describe('#callbackHandler', () => {
    it('should handle link request actions', () => {
      (request.authInfo as LinkRequestOption).action = 'LINK_REQUEST';
      (request.authInfo as LinkRequestOption).email = 'john@doe.co';

      callbackHandler(request, response);

      expect(response.cookie).toHaveBeenCalledWith('linkEmail', 'john@doe.co', {
        encode: expect.any(Function),
        expires: expect.any(Date),
      });
      expect(response.redirect).toMatchInlineSnapshot(`
        [MockFunction] {
          "calls": Array [
            Array [
              "http://localhost:3000/auth/connect",
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

    it('should handle unauthenticated user', () => {
      callbackHandler(request, response);

      expect(response.sendStatus).toHaveBeenCalledWith(401);
    });

    it('should handle authenticated user', () => {
      const user: User = Object.assign(new User(), {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.co',
        roles: [Role.USER],
        createdAt: new Date(0),
      });
      user.id = '5ff88e933bec1b765c94a4ae';

      request.user = user;

      callbackHandler(request, response);

      expect(response.cookie).toHaveBeenCalledWith('jwt', expect.any(String));
      expect(response.redirect).toHaveBeenCalledWith('/');
    });
  });
});
