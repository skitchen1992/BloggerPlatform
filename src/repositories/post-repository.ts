import { Result, ResultStatus } from '../types/common/result';
import { searchQueryBuilder } from '../utils/helpers';
import { IPostSchema, PostModel } from '../models/post';
import { PostMapper } from '../mappers/post-mapper';
import { GetPostsQuery } from '../types/post-types';
import { PostListDTO } from '../dto/post-list-dto';
import { PostDTO } from '../dto/post-dto';
import { UpdateQuery } from 'mongoose';
import { ObjectId } from 'mongodb';
import { LikeModel, LikeStatus, ParentType } from '../models/like';
import { ExtendedLikesInfo, NewestLike } from '../view-model/posts/ExtendedLikesInfoView';
import { UserModel } from '../models/user';
import { NEWEST_LIKES_COUNT } from '../utils/consts';

export class PostRepository {

  constructor(
    protected postModel: typeof PostModel,
    protected likeModel: typeof LikeModel,
    protected userModel: typeof UserModel,
  ) {
  }

  private async getLikeDislikeCounts(postId: string): Promise<{ likesCount: number, dislikesCount: number }> {

    const result = await this.likeModel.aggregate([
      { $match: { parentId: postId, parentType: ParentType.POST } },
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

  private async getNewestLikes(postId: string, count: number): Promise<NewestLike[]> {
    const newestLikes = await this.likeModel.find({ parentId: postId, parentType: ParentType.POST })
      .sort({ createdAt: -1 })
      .limit(count)
      .exec();


    return await Promise.all(newestLikes.map(async (like) => {
      const user = await this.userModel.findById(like.authorId).exec();
      return {
        addedAt: like.createdAt,
        userId: like.authorId,
        login: user ? user.login : '',
      };
    }));
  }

  private async getUserLikeStatus(postId: string, userId: string): Promise<LikeStatus> {
    const user = await this.likeModel.findOne({
      parentId: postId,
      parentType: ParentType.POST,
      authorId: userId,
    }).lean();

    return user?.status || LikeStatus.NONE;
  }

  private async getLikesInfoForAuthUser(postId: string, userId: string): Promise<ExtendedLikesInfo> {

    const likeDislikeCounts = await this.getLikeDislikeCounts(postId);
    const likeStatus = await this.getUserLikeStatus(postId, userId);
    const newestLikes = await this.getNewestLikes(postId, NEWEST_LIKES_COUNT);


    return {
      likesCount: likeDislikeCounts.likesCount,
      dislikesCount: likeDislikeCounts.dislikesCount,
      myStatus: likeStatus,
      newestLikes,
    };
  }

  private async getLikesInfoForNotAuthUser(postId: string): Promise<ExtendedLikesInfo> {

    const likeDislikeCounts = await this.getLikeDislikeCounts(postId);
    const likeStatus = await this.getUserLikeStatus(postId, '');
    const newestLikes = await this.getNewestLikes(postId, NEWEST_LIKES_COUNT);

    return {
      likesCount: likeDislikeCounts.likesCount,
      dislikesCount: likeDislikeCounts.dislikesCount,
      myStatus: likeStatus,
      newestLikes,
    };
  }

  public async getPostById(id: string, userId?: string): Promise<Result<PostDTO | null>> {
    const post = await this.postModel.findById(id).lean();

    const extendedLikesInfo = userId ? await this.getLikesInfoForAuthUser(id, userId) : await this.getLikesInfoForNotAuthUser(id);

    return {
      data: post ? PostMapper.toPostDTO(post, extendedLikesInfo) : null,
      status: post ? ResultStatus.Success : ResultStatus.NotFound,
    };
  }

  public async getPosts(
    query: GetPostsQuery,
    params?: { blogId?: string },
    userId?: string): Promise<Result<PostListDTO>> {

    const filters = searchQueryBuilder.getPosts(query, params);

    const posts = await this.postModel.find(filters.query).sort(filters.sort).skip(filters.skip).limit(filters.pageSize);

    const totalCount = await this.postModel.countDocuments(filters.query);

    const postList = await Promise.all(posts.map(async (post) => {
      if (userId) {
        const extendedLikesInfo = await this.getLikesInfoForAuthUser(post._id.toString(), userId);
        return PostMapper.toPostDTO(post, extendedLikesInfo);
      } else {
        const extendedLikesInfo = await this.getLikesInfoForNotAuthUser(post._id.toString());
        return PostMapper.toPostDTO(post, extendedLikesInfo);
      }
    }));

    const result = new PostListDTO(postList, totalCount, filters.pageSize, filters.page);

    return { data: result, status: ResultStatus.Success };
  }

  public async createPost(obj: IPostSchema): Promise<Result<string | null>> {
    try {
      const data = new this.postModel(obj);

      await data.save();

      return { data: data._id.toString(), status: ResultStatus.Success };
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  async updatePostById(id: string, data: UpdateQuery<IPostSchema>): Promise<Result<null>> {
    try {

      const updateResult = await this.postModel.updateOne({ _id: new ObjectId(id) }, data);

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

  public async deletePostById(id: string): Promise<Result<null>> {
    try {
      const blog = await this.postModel.findByIdAndDelete(new ObjectId(id));

      if (blog) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.NotFound };
    }
  }

  public async isExistPost(commentId: string) {
    const post = await this.postModel.findById(commentId).lean();

    return {
      data: null,
      status: post ? ResultStatus.Success : ResultStatus.NotFound,
    };
  }
}


