import { Result, ResultStatus } from '../types/common/result';
import { CreatePostForBlogRequestView } from '../view/posts/CreatePostForBlogRequestView';
import { UpdatePostRequestView } from '../view';
import { Post } from '../dto/new-post-dto';
import { BlogRepository } from '../repositories/blog-repository';
import { PostRepository } from '../repositories/post-repository';

export class PostService {

  constructor(protected blogRepository: BlogRepository,
              protected postRepository: PostRepository,
  ) {
  }

  async createPost(body: CreatePostForBlogRequestView, params: { blogId: string }): Promise<Result<string | null>> {
    try {

      const { status, data } = await this.blogRepository.getBlogById(params.blogId);

      if (status === ResultStatus.NotFound) {
        return { data: null, status: ResultStatus.NotFound };
      }

      const post = new Post(
        body.title,
        body.shortDescription,
        body.content,
        data!.name,
        data!.id);

      const { data: postId } = await this.postRepository.createPost(post);

      return { data: postId, status: ResultStatus.Success };
    } catch (error) {
      console.log(`Post not created: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };

  async createPostForBlog(body: CreatePostForBlogRequestView, params: {
    blogId: string
  }): Promise<Result<string | null>> {
    try {
      const { status, data } = await this.blogRepository.getBlogById(params.blogId);

      if (status === ResultStatus.NotFound) {
        return { data: null, status: ResultStatus.NotFound };
      }

      const post = new Post(
        body.title,
        body.shortDescription,
        body.content,
        data!.name,
        data!.id,
      );

      const { data: postId } = await this.postRepository.createPost(post);

      return { data: postId, status: ResultStatus.Success };
    } catch (error) {
      console.log(`Post not created: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };

  async updatePost(id: string, data: UpdatePostRequestView) {
    try {
      const { status } = await this.postRepository.updatePostById(id, data);

      return { data: null, status };
    } catch (error) {
      console.log(`Post not updated: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };

  async deletePost(id: string) {
    try {
      const { status } = await this.postRepository.deletePostById(id);

      return { data: null, status };

    } catch (error) {
      console.log(`Post not deleted: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };
}
