import { ObjectID } from 'bson';
import * as jwt from 'jsonwebtoken';
import MockDate from 'mockdate';

import * as mongooseHelper from '@boilerz/mongoose-helper';

import * as emailHelper from '../../helper/email';
import { ExternalProvider } from '../../model/user/ExternalProviderAccount';
import Profile from '../../model/user/Profile';
import User from '../../model/user/User';
import UserModel from '../../model/user/UserModel';
import * as authenticationService from '../../service/authentication';

describe('[service] authentication', () => {
  const johnDoe = Object.freeze({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.com',
  });
  let sendLinkAccountRequestSpy: jest.SpyInstance;

  beforeAll(async () =>
    mongooseHelper.connect(undefined, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }),
  );

  beforeEach(async () => {
    MockDate.set(new Date(0));
    await mongooseHelper.dropDatabase();
    sendLinkAccountRequestSpy = jest
      .spyOn(emailHelper, 'sendLinkAccountRequest')
      .mockResolvedValue();
  });
  afterEach(() => MockDate.reset());
  afterAll(() => mongooseHelper.disconnect());

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

  describe('#continueWith', () => {
    it('should sign up when no user exist with this email / provider.id', async () => {
      const user = await authenticationService.continueWith(
        johnDoe,
        ExternalProvider.GOOGLE,
        {
          id: '42',
          data: {
            extra: 'google extra',
          },
        },
      );

      expect(user).toBeInstanceOf(User);
      expect(sendLinkAccountRequestSpy).not.toHaveBeenCalled();
    });

    it('should ask to link the provider (if not already) to the user account if email matches', async () => {
      await authenticationService.continueWith(
        johnDoe,
        ExternalProvider.FACEBOOK,
        {
          id: '15',
          data: {
            extra: 'facebook extra',
          },
        },
      );
      const linkCode = await authenticationService.continueWith(
        johnDoe,
        ExternalProvider.GOOGLE,
        {
          id: '42',
          data: {
            extra: 'google extra',
          },
        },
      );

      expect(linkCode).toHaveLength(6);
      expect(sendLinkAccountRequestSpy).toHaveBeenCalledWith({
        ...johnDoe,
        linkCode,
      });
    });

    it('should sign in if the user is registered and active with this provider', async () => {
      const appleProviderData = {
        id: '8',
        data: {
          extra: 'apple extra',
        },
      };
      await authenticationService.continueWith(
        johnDoe,
        ExternalProvider.APPLE,
        appleProviderData,
      );
      const user = await authenticationService.continueWith(
        johnDoe,
        ExternalProvider.APPLE,
        appleProviderData,
      );

      expect(user).toBeInstanceOf(User);
      expect(sendLinkAccountRequestSpy).not.toHaveBeenCalled();
    });

    it('should update provider link code when it expires', async () => {
      MockDate.reset();

      await authenticationService.continueWith(
        johnDoe,
        ExternalProvider.GITHUB,
        {
          id: '4',
          data: {},
        },
      );

      const originalLinkCode = await authenticationService.continueWith(
        johnDoe,
        ExternalProvider.GOOGLE,
        {
          id: '42',
          data: {},
        },
      );

      await UserModel.updateOne(
        { email: johnDoe.email },
        { 'provider.google.linkCodeExpirationDate': 0 },
      );
      const updatedLinkCode = await authenticationService.continueWith(
        johnDoe,
        ExternalProvider.GOOGLE,
        {
          id: '42',
          data: {},
        },
      );

      expect(originalLinkCode).toHaveLength(6);
      expect(updatedLinkCode).toHaveLength(6);
      expect(originalLinkCode).not.toEqual(updatedLinkCode);
    });

    it('should return same non expired link code after first link attempt', async () => {
      await authenticationService.continueWith(
        johnDoe,
        ExternalProvider.GITHUB,
        {
          id: '4',
          data: {},
        },
      );
      const originalLinkCode = await authenticationService.continueWith(
        johnDoe,
        ExternalProvider.GOOGLE,
        {
          id: '42',
          data: {},
        },
      );
      const linkCode = await authenticationService.continueWith(
        johnDoe,
        ExternalProvider.GOOGLE,
        {
          id: '42',
          data: {},
        },
      );

      expect(originalLinkCode).toHaveLength(6);
      expect(linkCode).toHaveLength(6);
      expect(originalLinkCode).toEqual(linkCode);
    });
  });
});
