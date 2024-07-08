import { ObjectId } from 'mongodb';
import { getDateFromObjectId } from '../utils/dates/dates';

export class Visit {
  _id: ObjectId;
  date: string;

  constructor(
    public ip: string,
    public url: string,
  ) {
    this._id = new ObjectId();
    this.date = getDateFromObjectId(this._id);
  }
}
