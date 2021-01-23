import util from 'util';
import { VerifyFunction } from 'passport-google-oauth';
import User from '@boilerz/super-server-auth-core/model/user/User';
import { LinkRequestOption } from '../../strategy';

const strategyVerifyFunctionMockName = 'strategy.verifyFunction';

export const mockVerifyFunction = () =>
  jest.fn().mockName(strategyVerifyFunctionMockName);

const serializer: jest.SnapshotSerializerPlugin = {
  test(fn: jest.Mock): boolean {
    return fn?.getMockName() === strategyVerifyFunctionMockName;
  },
  serialize(
    val: jest.Mock<
      VerifyFunction,
      [Error | null, string | boolean | User, LinkRequestOption | undefined]
    >,
  ): string {
    return val.mock.calls
      .map((call) => {
        const [error, booleanUserOrLinkCode, linkRequestOption] = call;
        const args = [
          error instanceof Error ? error.message : error,
          booleanUserOrLinkCode instanceof User
            ? util.inspect(booleanUserOrLinkCode.profile())
            : booleanUserOrLinkCode,
          linkRequestOption
            ? `${linkRequestOption.action}:${linkRequestOption.email}`
            : undefined,
        ]
          .map((arg) => `${arg}`)
          .join(', ');
        return `done(${args})`;
      })
      .join('\n');
  },
};

export default serializer;
