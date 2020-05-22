import { DocumentType } from '@typegoose/typegoose';
import * as jwt from 'jsonwebtoken';
import logger from '@boilerz/logger';

import UserInput from '../model/user/UserInput';
import User from '../model/user/User';
import UserModel, { UserSchema } from '../model/user/UserModel';

const secret = process.env.JWT_SECRET || Math.random().toString(36);
const SIGN_OPTIONS: jwt.SignOptions = {
  expiresIn: parseInt(
    process.env.JWT_EXPIRE_IN || (30 * 60 * 1000).toString(),
    10,
  ),
};

if (!process.env.JWT_SECRET) {
  logger.warn('JWT_SECRET env var is not defined');
}

if (!process.env.JWT_EXPIRE_IN) {
  logger.warn(
    { defaultExpiresIn: SIGN_OPTIONS.expiresIn },
    'JWT_EXPIRE_IN env var is not defined (second units)',
  );
}

export async function signUp(user: UserInput): Promise<User> {
  const createdUser: DocumentType<UserSchema> = await UserModel.create(user);
  return createdUser.toObjectType(User);
}

export function signToken(user: User): string {
  return jwt.sign({ ...user.profile(), id: user.id }, secret, SIGN_OPTIONS);
}
