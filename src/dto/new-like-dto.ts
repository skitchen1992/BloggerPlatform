import { ObjectId } from 'mongodb';
import { getDateFromObjectId } from '../utils/dates/dates';
import { LikeStatus, ParentType } from '../models/like';

export class Like {
  _id: ObjectId;
  createdAt: string;

  constructor(
    public status: LikeStatus,
    public authorId: string,
    public parentId: string,
    public parentType: ParentType,
  ) {
    this._id = new ObjectId();
    this.createdAt = getDateFromObjectId(this._id);

  }
}
