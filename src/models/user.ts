import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { SETTINGS } from '../utils/settings';

interface EmailConfirmation {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
}

interface RecoveryCode {
  code: string;
  isUsed: boolean;
}

export interface IUserSchema {
  _id: ObjectId;
  login: string;
  email: string;
  password: string;
  createdAt: string;
  emailConfirmation: EmailConfirmation;
  recoveryCode?: RecoveryCode;
}

export const UserSchema = new mongoose.Schema<IUserSchema>({
  login: { type: String, require: true, minlength: 3, maxlength: 10 },
  email: { type: String, require: true },
  password: { type: String, require: true },
  createdAt: { type: String, require: true },
  emailConfirmation: {
    confirmationCode: { type: String, require: true },
    expirationDate: { type: String, require: true },
    isConfirmed: { type: Boolean, require: true },
  },
  recoveryCode: {
    code: { type: String, require: true },
    isUsed: { type: Boolean, require: true },
  },

});
export const UserModel = mongoose.model<IUserSchema>(SETTINGS.DB.COLLECTION.USERS, UserSchema);
