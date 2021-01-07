import { prop } from '@typegoose/typegoose';
import * as _ from 'lodash';
import crypto from 'crypto';

export default class LocalProviderAccount {
  @prop({ default: true })
  isActive: boolean;

  @prop()
  emailValidationCode: string;

  @prop()
  emailValidationCodeExpirationDate: Date;

  @prop({
    required: true,
    validate: {
      validator: _.negate(_.isEmpty),
      message: 'user:validator:passwordBlank',
    },
  })
  hashedPassword?: string;

  @prop()
  salt?: string;

  set password(password: string) {
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  }

  authenticate(plainTextPassword: string): boolean {
    return this.encryptPassword(plainTextPassword) === this.hashedPassword;
  }

  makeSalt(): string {
    return crypto.randomBytes(16).toString('base64');
  }

  encryptPassword(password: string): string {
    const salt: Buffer = Buffer.from(this.salt as string, 'base64');
    return crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha1')
      .toString('base64');
  }
}
