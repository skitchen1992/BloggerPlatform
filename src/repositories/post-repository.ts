import { Result, ResultStatus } from '../types/common/result';
import { searchQueryBuilder } from '../utils/helpers';
import { PostModel } from '../models/post';
import { PostMapper } from '../mappers/post-mapper';
import { GetPostsQuery } from '../types/post-types';
import { PostListDTO } from '../dto/post-list-dto';
import { PostDTO } from '../dto/post-dto';

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

    const posts = await PostModel.find(filters.query);

    const totalCount = await PostModel.countDocuments(filters.query);

    const postList = posts.map(post => (PostMapper.toPostDTO(post)));

    const result = new PostListDTO(postList, totalCount, filters.pageSize, filters.page);

    return { data: result, status: ResultStatus.Success };
  }
}

export const postRepository = new PostRepository();
