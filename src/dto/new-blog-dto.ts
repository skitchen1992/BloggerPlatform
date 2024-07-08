import { ObjectId } from 'mongodb';
import { getDateFromObjectId } from '../utils/dates/dates';

export class Blog {
  _id: ObjectId;
  createdAt: string;

  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public isMembership: boolean,
  ) {
    this._id = new ObjectId();
    this.createdAt = getDateFromObjectId(this._id);
  }
}
