import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { SETTINGS } from '../utils/settings';

export interface ICommentSchema extends Document {
  _id: ObjectId;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  postId: string;
  createdAt: string;
}

export const CommentSchema = new mongoose.Schema<ICommentSchema>({
  content: { type: String, require: true, minlength: 20, maxlength: 300 },
  commentatorInfo: {
    userId: { type: String, require: true },
    userLogin: { type: String, require: true },
  },
  postId: { type: String, require: true },
  createdAt: { type: String, require: true },

});
export const CommentModel = mongoose.model<ICommentSchema>(SETTINGS.DB.COLLECTION.COMMENTS, CommentSchema);
