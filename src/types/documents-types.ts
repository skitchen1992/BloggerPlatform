import { ObjectId } from 'mongodb';

export type DocumentDbType = {
  ip: string;
  url: string;
  date: string;
  _id: ObjectId;
};
