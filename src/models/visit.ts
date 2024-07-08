import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { SETTINGS } from '../utils/settings';

export interface IVisitSchema {
  _id: ObjectId;
  ip: string;
  url: string;
  date: string;
}

const VisitSchema = new mongoose.Schema<IVisitSchema>({
  ip: { type: String, require: true },
  url: { type: String, require: true },
  date: { type: String, require: true },
});
export const VisitModel = mongoose.model<IVisitSchema>(SETTINGS.DB.COLLECTION.VISITS, VisitSchema);
