import { LikeStatus } from '../../models/like';

export type NewestLike = {
  addedAt: string,
  userId: string,
  login: string
}

export type ExtendedLikesInfo = {
  likesCount: number,
  dislikesCount: number,
  myStatus: LikeStatus,
  newestLikes: NewestLike[]
}
