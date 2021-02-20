// eslint-disable-next-line max-classes-per-file
import { modelOptions, prop, Severity } from '@typegoose/typegoose';
import { registerEnumType } from 'type-graphql';

export enum ExternalProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  TWITTER = 'twitter',
  GITHUB = 'github',
}

registerEnumType(ExternalProvider, {
  name: 'ExternalProvider',
  description: 'External provider',
});

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class ExternalProviderData {
  @prop()
  id: string;

  @prop()
  data: Record<string, unknown>;
}

export default class ExternalProviderAccount extends ExternalProviderData {
  @prop({ default: false })
  isActive: boolean;

  @prop({ default: null })
  linkCode?: string;

  @prop({ default: null })
  linkCodeExpirationDate?: Date;
}
