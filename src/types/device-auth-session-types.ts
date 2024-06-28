import { ObjectId } from 'mongodb';

export type DeviceAuthSessionDbType = {
  _id: ObjectId;
  userId: string;
  ip: string;
  title: string;
  lastActiveDate: string;
  tokenIssueDate: string;
  tokenExpirationDate: string;
  deviceId: string;
};
