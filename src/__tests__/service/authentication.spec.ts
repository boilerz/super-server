import { ObjectID } from 'bson';
import MockDate from 'mockdate';

import * as jwt from 'jsonwebtoken';
import * as authenticationService from '../../service/authentication';

import User from '../../model/user/User';
import Profile from '../../model/user/Profile';

describe('[service] authentication', () => {
  beforeEach(() => MockDate.set(new Date(0)));
  afterEach(() => MockDate.reset());

  describe('#signToken', () => {
    it('should sign token successfully', () => {
      MockDate.set(new Date(0));

      const user: User = Object.assign(new User(), {
        _id: ObjectID.createFromTime(0),
        firstName: 'Johny',
        lastName: 'Boy',
        email: 'johny@boy.fr',
        createdAt: new Date(),
        documentVersion: 0,
        roles: [],
      });

      const token = authenticationService.signToken(user);
      const profile = jwt.decode(token) as Profile;

      expect(token.length).toBeGreaterThan(200);
      expect(profile).toMatchInlineSnapshot(`
        Object {
          "exp": 1800000,
          "firstName": "Johny",
          "iat": 0,
          "id": "000000000000000000000000",
          "lastName": "Boy",
          "roles": Array [],
        }
      `);
    });
  });
});
