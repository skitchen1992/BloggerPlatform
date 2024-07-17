import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { SETTINGS } from '../utils/settings';

export interface IPostSchema {
  _id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
}

export const PostSchema = new mongoose.Schema<IPostSchema>({
  title: { type: String, require: true, maxlength: 30 },
  shortDescription: { type: String, require: true, maxlength: 100 },
  content: { type: String, require: true, maxlength: 1000 },
  blogId: { type: String, require: true },
  blogName: { type: String, required: true },
  createdAt: { type: String, require: true },

});
export const PostModel = mongoose.model<IPostSchema>(SETTINGS.DB.COLLECTION.POSTS, PostSchema);
