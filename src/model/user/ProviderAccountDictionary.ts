import { prop } from '@typegoose/typegoose';
import LocalProviderAccount from './LocalProviderAccount';
import ExternalProviderAccount from './ExternalProviderAccount';

export default class ProviderAccountDictionary {
  @prop({ _id: false })
  local: LocalProviderAccount;

  @prop({ _id: false })
  google: ExternalProviderAccount;

  @prop({ _id: false })
  facebook: ExternalProviderAccount;

  @prop({ _id: false })
  apple: ExternalProviderAccount;

  @prop({ _id: false })
  twitter: ExternalProviderAccount;

  @prop({ _id: false })
  github: ExternalProviderAccount;
}
