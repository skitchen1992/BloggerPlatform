import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { SETTINGS } from '../utils/settings';

export interface IBlogSchema {
  _id: ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

export const BlogSchema = new mongoose.Schema<IBlogSchema>({
  name: { type: String, require: true, maxlength: 15 },
  description: { type: String, require: true, maxlength: 500 },
  websiteUrl: { type: String, require: true, maxlength: 500 },
  createdAt: { type: String, require: true },
  isMembership: { type: Boolean, required: true },
});
export const BlogModel = mongoose.model<IBlogSchema>(SETTINGS.DB.COLLECTION.BLOGS, BlogSchema);
