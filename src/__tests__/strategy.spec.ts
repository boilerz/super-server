import * as mongooseHelper from '@boilerz/mongoose-helper';
import * as authenticationService from '@boilerz/super-server-auth-core/service/authentication';

import { verify } from '../strategy';
import { johnDoe } from './__fixtures/profiles';
import strategyVerifyFunctionSerializer, {
  mockVerifyFunction,
} from './__serializers/strategyVerifyFunctionSerializer';

describe('strategy', () => {
  const accessToken = 'dummy.access.token';
  const refreshToken = 'dummy.refresh.token';
  let done: jest.Mock;

  beforeAll(async () => {
    expect.addSnapshotSerializer(strategyVerifyFunctionSerializer);
    await mongooseHelper.connect(undefined, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  });
  beforeEach(async () => {
    done = mockVerifyFunction();
    await mongooseHelper.dropDatabase();
  });

  afterAll(async () => {
    await mongooseHelper.disconnect();
  });

  describe('#verify', () => {
    it('should fail to verify a profile with no verified email available', async () => {
      await verify(
        accessToken,
        refreshToken,
        { ...johnDoe, emails: undefined },
        done,
      );
      await verify(accessToken, refreshToken, { ...johnDoe, emails: [] }, done);
      await verify(
        accessToken,
        refreshToken,
        { ...johnDoe, emails: [{ value: 'john@doe.co', verified: false }] },
        done,
      );

      expect(done).toMatchInlineSnapshot(`
        done(Missing verified profile email, undefined, undefined)
        done(Missing verified profile email, undefined, undefined)
        done(Missing verified profile email, undefined, undefined)
      `);
    });

    it('should return a link request', async () => {
      jest
        .spyOn(authenticationService, 'continueWith')
        .mockResolvedValue('123456');
      await verify(accessToken, refreshToken, johnDoe, done);

      expect(done).toMatchInlineSnapshot(
        `done(null, true, LINK_REQUEST:john@doe.co)`,
      );
    });

    it('should verify with an user successfully', async () => {
      await verify(accessToken, refreshToken, johnDoe, done);

      expect(done).toMatchInlineSnapshot(
        `done(null, { firstName: 'John', lastName: 'John', roles: [ 'user' ] }, undefined)`,
      );
    });
  });
});
