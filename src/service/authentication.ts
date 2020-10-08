import { DocumentType } from '@typegoose/typegoose';
import * as jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import crypto from 'crypto';
import { SignOptions } from 'jsonwebtoken';
import UserInput from '../model/user/UserInput';
import User from '../model/user/User';
import UserModel, { UserSchema } from '../model/user/UserModel';
import * as emailHelper from '../helper/email';
import config from '../config';

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
  return jwt.sign({ ...user.profile(), id: user.id }, config.jwt.secret, {
    ...config.jwt.signOptions,
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
