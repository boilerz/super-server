import { prop } from '@typegoose/typegoose';

import { EntityModel } from '../Entity';
import ProviderAccountDictionary from './ProviderAccountDictionary';
import User from './User';

export class UserSchema extends User {
  @prop({ _id: false })
  provider: ProviderAccountDictionary;
}

const UserModel: EntityModel<UserSchema> = UserSchema.getModel();

export default UserModel;
