import { getCurrentDate } from '../utils/dates/dates';

export class Blog {
  createdAt: string;

  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public isMembership: boolean,
  ) {
    this.createdAt = getCurrentDate();
  }
}
