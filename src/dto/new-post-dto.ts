import { ObjectId } from 'mongodb';
import { getDateFromObjectId } from '../utils/dates/dates';

export class Post {
  _id: ObjectId;
  createdAt: string;

  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogName: string,
    public blogId: string,
  ) {
    this._id = new ObjectId();
    this.createdAt = getDateFromObjectId(this._id);
  }
}
