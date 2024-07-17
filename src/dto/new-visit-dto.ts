import { getCurrentDate } from '../utils/dates/dates';

export class Visit {
  date: string;

  constructor(
    public ip: string,
    public url: string,
  ) {
    this.date = getCurrentDate();
  }
}
