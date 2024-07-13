import { ObjectId } from 'mongodb';
import { getDateFromObjectId } from '../utils/dates/dates';


interface ICommentatorInfo {
  userId: string,
  userLogin: string
}

export class Comment {
  _id: ObjectId;
  createdAt: string;

  constructor(
    public content: string,
    public commentatorInfo: ICommentatorInfo,
    public postId: string,
  ) {
    this._id = new ObjectId();
    this.createdAt = getDateFromObjectId(this._id);
  }
}
