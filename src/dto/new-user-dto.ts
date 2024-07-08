import { ObjectId } from 'mongodb';
import { add, getDateFromObjectId } from '../utils/dates/dates';
import { getUniqueId } from '../utils/helpers';

interface IEmailConfirmation {
  isConfirmed: boolean,
  confirmationCode: string
  expirationDate: string
}

export class User {
  _id: ObjectId;
  createdAt: string;
  emailConfirmation: IEmailConfirmation

  constructor(
    public login: string,
    public password: string,
    public email: string,
  ) {
    this._id = new ObjectId();
    this.createdAt = getDateFromObjectId(this._id);
    this.emailConfirmation = {
      isConfirmed: false,
      confirmationCode: getUniqueId(),
      expirationDate: add(new Date(), { hours: 1 }),
    };
  }
}
