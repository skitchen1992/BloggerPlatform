import { getCurrentDate } from '../utils/dates/dates';


interface ICommentatorInfo {
  userId: string,
  userLogin: string
}

export class Comment {
  createdAt: string;

  constructor(
    public content: string,
    public commentatorInfo: ICommentatorInfo,
    public postId: string,
  ) {
    this.createdAt = getCurrentDate();
  }
}
