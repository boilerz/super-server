import { prop } from '@typegoose/typegoose';

import User from './User';
import { EntityModel } from '../Entity';
import ProviderAccountDictionary from './ProviderAccountDictionary';

export class UserSchema extends User {
  @prop({ _id: false })
  provider: ProviderAccountDictionary;
}

const UserModel: EntityModel<UserSchema> = UserSchema.getModel();

export default UserModel;
