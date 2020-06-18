import _ from 'lodash';
import { ObjectType, Field } from 'type-graphql';
import { prop } from '@typegoose/typegoose';

import Entity from '../Entity';
import Role from '../../enum/Role';
import Profile from './Profile';

async function validateEmailInUse(email: string): Promise<boolean> {
  // @ts-ignore
  return (await this.constructor.countDocuments({ email })) === 0;
}

@ObjectType()
export default class User extends Entity {
  @Field()
  @prop({ required: true })
  firstName: string;

  @Field()
  @prop({ required: true })
  lastName: string;

  @Field()
  @prop({
    required: true,
    unique: true,
    validate: [
      { validator: _.negate(_.isEmpty), message: 'user:validator:emailBlank' },
      { validator: validateEmailInUse, message: 'user:validator.emailInUse' },
    ],
    lowercase: true,
  })
  email: string;

  @Field(() => [String])
  @prop({
    required: true,
    type: String,
    enum: Role,
    default: [Role.USER],
  })
  roles: string[];

  @Field(() => Date)
  @prop({
    default: Date.now,
  })
  createdAt: Date;

  profile(): Profile {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      roles: this.roles,
    };
  }
}
