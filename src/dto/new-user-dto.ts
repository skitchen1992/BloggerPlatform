import { add, getCurrentDate } from '../utils/dates/dates';
import { getUniqueId } from '../utils/helpers';

interface IEmailConfirmation {
  isConfirmed: boolean,
  confirmationCode: string
  expirationDate: string
}

export class User {
  createdAt: string;
  emailConfirmation: IEmailConfirmation;

  constructor(
    public login: string,
    public password: string,
    public email: string,
  ) {
    this.createdAt = getCurrentDate();
    this.emailConfirmation = {
      isConfirmed: false,
      confirmationCode: getUniqueId(),
      expirationDate: add(new Date(), { hours: 1 }),
    };
  }
}
