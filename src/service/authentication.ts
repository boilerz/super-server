import { DocumentType } from '@typegoose/typegoose';
import * as jwt from 'jsonwebtoken';
import logger from '@boilerz/logger';
import dayjs from 'dayjs';
import crypto from 'crypto';
import { SignOptions } from 'jsonwebtoken';
import UserInput from '../model/user/UserInput';
import User from '../model/user/User';
import UserModel, { UserSchema } from '../model/user/UserModel';
import * as emailHelper from '../helper/email';
import config from '../config';

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
  const emailValidationCode = crypto.randomBytes(20).toString('hex');
  const emailValidationCodeExpirationDate = dayjs()
    .add(config.emailValidationExpiresDuration, 'hour')
    .toDate();
  const createdUser: DocumentType<UserSchema> = await UserModel.create({
    ...user,
    isActive: false,
    emailValidationCode,
    emailValidationCodeExpirationDate,
  });
  await emailHelper.sendValidationEmailRequest({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    validationCode: emailValidationCode,
  });
  return createdUser.toObjectType(User);
}

export function signToken(user: User, options?: SignOptions): string {
  return jwt.sign({ ...user.profile(), id: user.id }, secret, {
    ...SIGN_OPTIONS,
    ...options,
  });
}

export async function validateEmail(
  email: string,
  validationCode: string,
): Promise<boolean> {
  const user = await UserModel.findOne({
    email,
    emailValidationCode: validationCode,
  });
  if (
    !user ||
    dayjs(user.emailValidationCodeExpirationDate).isBefore(new Date())
  ) {
    return false;
  }

  user.isActive = true;
  await user.save();

  return true;
}
