import * as mongoose from 'mongoose';
import { Role, User } from './UserTypes';

export interface UserMongo extends Omit<User, '_id'>, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const Schema = new mongoose.Schema(
  {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    phone: {
      type: String,
      required: true,
      index: true // todo check this
    },
    photo: {
      type: String
    },
    matchesPlayed: {
      type: Number,
      required: true,
      default: 0
    },
    rating: {
      type: Number,
      required: true,
      default: 1000
    },
    token: {
      type: String
    },
    role: {
      type: String,
      required: true,
      default: Role.player
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'users'
  }
);

export default mongoose.model<UserMongo>('User', Schema);
