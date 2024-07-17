import { getCurrentDate } from '../utils/dates/dates';

export class Post {
  createdAt: string;

  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogName: string,
    public blogId: string,
  ) {

    this.createdAt = getCurrentDate();
  }
}
