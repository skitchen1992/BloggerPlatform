import { getCurrentDate } from '../utils/dates/dates';
import { LikeStatus, ParentType } from '../models/like';

export class Like {
  createdAt: string;

  constructor(
    public status: LikeStatus,
    public authorId: string,
    public parentId: string,
    public parentType: ParentType,
  ) {
    this.createdAt = getCurrentDate();

  }
}
