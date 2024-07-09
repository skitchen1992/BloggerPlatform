import { LikeStatus } from '../models/like';

export interface ILikesInfo {
  likesCount: number,
  dislikesCount: number,
  myStatus: LikeStatus
}

export class CommentDTO {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: ILikesInfo;

  constructor(
    id: string,
    content: string,
    commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    createdAt: string,
    likesInfo: ILikesInfo,
  ) {
    this.id = id;
    this.content = content;
    this.commentatorInfo = commentatorInfo;
    this.createdAt = createdAt;
    this.likesInfo = likesInfo;
  }
}
