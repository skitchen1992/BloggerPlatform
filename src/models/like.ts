import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { SETTINGS } from '../utils/settings';

export enum LikeStatus {
  LIKE = 'Like',
  DISLIKE = 'Dislike',
  NONE = 'None'
}

export enum ParentType {
  POST = 'Post',
  COMMENT = 'Comment'
}

export interface ILikeSchema {
  _id: ObjectId;
  createdAt: string;
  status: LikeStatus;
  authorId: string;
  parentId: string;
  parentType: ParentType;
}

export const LikeSchema = new mongoose.Schema<ILikeSchema>({
  createdAt: { type: String, required: true },
  status: { type: String, enum: Object.values(LikeStatus), required: true },
  authorId: { type: String, required: true },
  parentId: { type: String, required: true },
  parentType: { type: String, enum: Object.values(ParentType), required: true },
});

export const LikeModel = mongoose.model<ILikeSchema>(SETTINGS.DB.COLLECTION.LIKES, LikeSchema);
