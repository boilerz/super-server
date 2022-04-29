import { DocumentType, prop, getModelForClass } from '@typegoose/typegoose';
import { ObjectID } from 'bson';
import _ from 'lodash';
import type { Model } from 'mongoose';
import { plural } from 'pluralize';

const VERSION_KEY = 'documentVersion';

type StaticThis<T> = { new (): T };

export type EntityModel<T> = Model<DocumentType<T>> & T;

export default class Entity {
  @prop()
  documentVersion?: number;

  get id(): string {
    return _.get(this, '_id').toHexString();
  }

  set id(id: string) {
    Object.assign(this, { _id: ObjectID.createFromHexString(id) });
  }

  toObjectType<T extends Entity, OT>(
    this: DocumentType<T>,
    ObjectTypeConstructor: StaticThis<OT>,
  ): OT {
    return Object.assign(
      new ObjectTypeConstructor(),
      this.toObject({ virtuals: true, getters: true, versionKey: false }),
    );
  }

  static getModel<T extends Entity>(this: StaticThis<T>): EntityModel<T> {
    const collection: string = plural(
      _.lowerFirst(this.name.replace('Schema', '')),
    );

    return getModelForClass(this, {
      schemaOptions: { collection, versionKey: VERSION_KEY },
    }) as EntityModel<T>;
  }
}
