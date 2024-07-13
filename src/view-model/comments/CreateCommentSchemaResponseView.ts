import { LikeStatus } from '../../models/like';

export type CreateCommentSchemaResponseView = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus
  }
};
