import _ from 'lodash';
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
import ExternalProviderAccount, {
  ExternalProviderData,
  ExternalProvider,
} from '../model/user/ExternalProviderAccount';

async function updateProviderLinkingInformation(
  registeredUser: DocumentType<UserSchema>,
  provider: ExternalProvider,
  providerData: ExternalProviderData,
): Promise<string> {
  const linkCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  const linkCodeExpirationDate = dayjs()
    .add(config.externalProviderLinkCodeExpiresDuration, 'hour')
    .toDate();

  await UserModel.updateOne(
    {
      email: registeredUser.email,
    },
    {
      [`provider.${provider}`]: {
        ...providerData,
        isActive: false,
        linkCode,
        linkCodeExpirationDate,
      },
    },
  );

  if (config.isMailingSupportEnabled) {
    await emailHelper.sendLinkAccountRequest({
      email: registeredUser.email,
      firstName: registeredUser.firstName,
      lastName: registeredUser.lastName,
      linkCode,
    });
  }
  return linkCode;
}

export async function continueWith(
  user: Pick<UserSchema, 'firstName' | 'lastName' | 'email'>,
  provider: ExternalProvider,
  providerData: ExternalProviderData,
): Promise<User | string> {
  const registeredUser = await UserModel.findOne({ email: user.email });

  // No registered user ? Create a new one =>
  if (!registeredUser) {
    const createdUser: DocumentType<UserSchema> = await UserModel.create({
      ...user,
      [`provider.${provider}`]: {
        ...providerData,
        isActive: true,
      },
    });
    return createdUser.toObjectType(User);
  }

  const registeredUserProvider = registeredUser.provider[provider];

  // Return already registered user
  if (registeredUserProvider?.id === providerData.id) {
    if (registeredUserProvider.isActive) {
      return registeredUser.toObjectType(User);
    }

    // Link information update
    if (
      dayjs(registeredUserProvider.linkCodeExpirationDate).isBefore(Date.now())
    ) {
      return updateProviderLinkingInformation(
        registeredUser,
        provider,
        providerData,
      );
    }

    return registeredUserProvider.linkCode!;
  }

  // Already registered (or probably impossible provider id update) ? Ask to link =>
  return updateProviderLinkingInformation(
    registeredUser,
    provider,
    providerData,
  );
}

export async function localSignUp(user: UserInput): Promise<User> {
  const emailValidationCode = crypto.randomBytes(20).toString('hex');
  const emailValidationCodeExpirationDate = dayjs()
    .add(config.emailValidationExpiresDuration, 'hour')
    .toDate();
  const createdUser: DocumentType<UserSchema> = await UserModel.create({
    ..._.omit(user, 'password'),
    'provider.local': {
      isActive: false,
      emailValidationCode,
      emailValidationCodeExpirationDate,
      password: user.password,
    },
  });
  if (config.isMailingSupportEnabled) {
    await emailHelper.sendValidationEmailRequest({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      validationCode: emailValidationCode,
    });
  }
  return createdUser.toObjectType(User);
}

export function signToken(user: User, options?: SignOptions): string {
  return jwt.sign({ ...user.profile(), id: user.id }, config.jwt.secret, {
    ...config.jwt.signOptions,
    ...options,
  });
}

async function validateProvider(
  email: string,
  provider: ExternalProvider | 'local',
  code: string,
): Promise<boolean> {
  const user = await UserModel.findOne({
    email,
    [`provider.${provider}.${
      provider === 'local' ? 'emailValidationCode' : 'linkCode'
    }`]: code,
  });

  if (!user) return false;

  const providerAccount = user.provider[provider];
  if (
    !user ||
    dayjs(
      providerAccount instanceof ExternalProviderAccount
        ? providerAccount.linkCodeExpirationDate
        : providerAccount.emailValidationCodeExpirationDate,
    ).isBefore(Date.now())
  ) {
    return false;
  }

  providerAccount.isActive = true;
  await user.save();

  return true;
}

export async function linkProvider(
  email: string,
  provider: ExternalProvider,
  linkCode: string,
): Promise<boolean> {
  return validateProvider(email, provider, linkCode);
}

export async function validateEmail(
  email: string,
  validationCode: string,
): Promise<boolean> {
  return validateProvider(email, 'local', validationCode);
}
