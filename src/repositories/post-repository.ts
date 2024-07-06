import { Result, ResultStatus } from '../types/common/result';
import { searchQueryBuilder } from '../utils/helpers';
import { IPostSchema, PostModel } from '../models/post';
import { PostMapper } from '../mappers/post-mapper';
import { GetPostsQuery } from '../types/post-types';
import { PostListDTO } from '../dto/post-list-dto';
import { PostDTO } from '../dto/post-dto';
import { UpdateQuery } from 'mongoose';
import { ObjectId } from 'mongodb';

class PostRepository {
  public async getPostById(id: string): Promise<Result<PostDTO | null>> {
    const post = await PostModel.findById(id);

    return {
      data: post ? PostMapper.toPostDTO(post) : null,
      status: post ? ResultStatus.Success : ResultStatus.NotFound,
    };
  }

  public async getPosts(query: GetPostsQuery, params?: { blogId: string }): Promise<Result<PostListDTO>> {
    const filters = searchQueryBuilder.getPosts(query, params);

    const posts = await PostModel.find(filters.query).sort(filters.sort).skip(filters.skip).limit(filters.pageSize);

    const totalCount = await PostModel.countDocuments(filters.query);

    const postList = posts.map(post => (PostMapper.toPostDTO(post)));

    const result = new PostListDTO(postList, totalCount, filters.pageSize, filters.page);

    return { data: result, status: ResultStatus.Success };
  }

  public async createPost(obj: IPostSchema): Promise<Result<string | null>> {
    try {
      const data = new PostModel(obj);

      await data.save();

      return { data: data._id.toString(), status: ResultStatus.Success };
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  async updatePostById(id: string, data: UpdateQuery<IPostSchema>): Promise<Result<null>> {
    try {

      const updateResult = await PostModel.updateOne({ _id: new ObjectId(id) }, data);

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
      const blog = await PostModel.findByIdAndDelete(new ObjectId(id));

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
}

export const postRepository = new PostRepository();
