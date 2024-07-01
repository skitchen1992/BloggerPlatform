import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { SETTINGS } from '../utils/settings';

export interface IDeviceSessionSchema extends Document {
  _id: ObjectId;
  userId: string;
  ip: string;
  title: string;
  lastActiveDate: string;
  tokenIssueDate: string;
  tokenExpirationDate: string;
  deviceId: string;
}

const DeviceSessionSchema = new mongoose.Schema<IDeviceSessionSchema>({
  userId: { type: String, require: true },
  ip: { type: String, require: true },
  title: { type: String, require: true },
  lastActiveDate: { type: String, require: true },
  tokenIssueDate: { type: String, require: true },
  tokenExpirationDate: { type: String, require: true },
  deviceId: { type: String, require: true },
});
export const DeviceSessionModel = mongoose.model<IDeviceSessionSchema>(SETTINGS.DB.COLLECTION.DEVICE_AUTH_SESSIONS, DeviceSessionSchema);
