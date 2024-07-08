import { ObjectId } from 'mongodb';
import { getDateFromObjectId } from '../utils/dates/dates';


interface IEmailConfirmation {
  isConfirmed: boolean,
  confirmationCode: string
  expirationDate: string
}

export class User {
  _id: ObjectId;
  createdAt: string;

  constructor(
    public login: string,
    public password: string,
    public email: string,
    public emailConfirmation: IEmailConfirmation
  ) {
    this._id = new ObjectId();
    this.createdAt = getDateFromObjectId(this._id);
  }
}
