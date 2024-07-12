import { Result, ResultStatus } from '../types/common/result';
import { searchQueryBuilder } from '../utils/helpers';
import { GetCommentsQuery } from '../types/comments-types';
import { CommentModel, ICommentSchema } from '../models/comment';
import { CommentMapper } from '../mappers/comment-mapper';
import { CommentListDTO } from '../dto/comment-list-dto';
import { UpdateQuery } from 'mongoose';
import { ObjectId } from 'mongodb';
import { LikeModel, LikeStatus, ParentType } from '../models/like';
import { ILikesInfo } from '../dto/comment-dto';

export class CommentRepository {

  constructor(protected commentModel: typeof CommentModel, protected likeModel: typeof LikeModel) {
  }

  private async getLikesInfoForAuthUser(commentId: string, userId: string): Promise<ILikesInfo> {

    const likeDislikeCounts = await this.getLikeDislikeCounts(commentId);
    const likeStatus = await this.getUserLikeStatus(commentId, userId);

    return {
      likesCount: likeDislikeCounts.likesCount,
      dislikesCount: likeDislikeCounts.dislikesCount,
      myStatus: likeStatus,
    };
  }

  private async getLikesInfoForNotAuthUser(commentId: string): Promise<ILikesInfo> {

    const likeDislikeCounts = await this.getLikeDislikeCounts(commentId);
    const likeStatus = await this.getUserLikeStatus(commentId, '');

    return {
      likesCount: likeDislikeCounts.likesCount,
      dislikesCount: likeDislikeCounts.dislikesCount,
      myStatus: likeStatus,
    };
  }

  private async getLikeDislikeCounts(commentId: string): Promise<{ likesCount: number, dislikesCount: number }> {

    const result = await this.likeModel.aggregate([
      { $match: { parentId: commentId, parentType: ParentType.COMMENT } },
      {
        $group: {
          _id: null,
          likesCount: { $sum: { $cond: [{ $eq: ['$status', LikeStatus.LIKE] }, 1, 0] } },
          dislikesCount: { $sum: { $cond: [{ $eq: ['$status', LikeStatus.DISLIKE] }, 1, 0] } },
        },
      },
    ]);

    return result.length ? result[0] : { likesCount: 0, dislikesCount: 0 };
  }

  private async getUserLikeStatus(commentId: string, userId: string): Promise<LikeStatus> {
    const user = await this.likeModel.findOne({
      parentId: commentId,
      parentType: ParentType.COMMENT,
      authorId: userId,
    }).lean();

    return user?.status || LikeStatus.NONE;
  }

  public async getCommentForAuthUserById(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId).lean();

    const like = await this.getLikesInfoForAuthUser(commentId, userId);

    return {
      data: comment ? CommentMapper.toCommentDTO(comment, like) : null,
      status: comment ? ResultStatus.Success : ResultStatus.NotFound,
    };
  }

  public async getCommentForNotAuthUserById(commentId: string) {
    const comment = await this.commentModel.findById(commentId).lean();

    const like = await this.getLikesInfoForNotAuthUser(commentId);

    return {
      data: comment ? CommentMapper.toCommentDTO(comment, like) : null,
      status: comment ? ResultStatus.Success : ResultStatus.NotFound,
    };
  }

  public async isExistComment(commentId: string) {
    const comment = await this.commentModel.findById(commentId).lean();

    return {
      data: null,
      status: comment ? ResultStatus.Success : ResultStatus.NotFound,
    };
  }

  public async getComments(
    query: GetCommentsQuery,
    params: { postId: string, userId?: string },
  ) {
    const filters = searchQueryBuilder.getComments(query, params);

    const comments = await this.commentModel.find(filters.query).sort(filters.sort).skip(filters.skip).limit(filters.pageSize).lean();

    const totalCount = await this.commentModel.countDocuments(filters.query);

    const commentList = await Promise.all(comments.map(async (comment) => {
      if (params.userId) {
        const like = await this.getLikesInfoForAuthUser(comment._id.toString(), params.userId);
        return CommentMapper.toCommentDTO(comment, like);
      } else {
        const like = await this.getLikesInfoForNotAuthUser(comment._id.toString());
        return CommentMapper.toCommentDTO(comment, like);
      }
    }));

    const result = new CommentListDTO(commentList, totalCount, filters.pageSize, filters.page);

    return { data: result, status: ResultStatus.Success };
  }

  public async updateCommentById(id: string, data: UpdateQuery<ICommentSchema>): Promise<Result<null>> {
    try {

      const updateResult = await this.commentModel.updateOne({ _id: new ObjectId(id) }, data);

      if (updateResult.modifiedCount === 1) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  public async deleteCommentById(id: string): Promise<Result<null>> {
    try {
      const comment = await this.commentModel.findByIdAndDelete(new ObjectId(id));

      if (comment) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.NotFound };
    }
  }

  public async createComment(obj: ICommentSchema): Promise<Result<string | null>> {
    try {
      const data = new CommentModel(obj);

      await data.save();

      return { data: data._id.toString(), status: ResultStatus.Success };
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }
}
