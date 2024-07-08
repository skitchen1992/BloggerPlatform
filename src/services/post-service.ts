import { Result, ResultStatus } from '../types/common/result';
import { CreatePostForBlogRequestView } from '../view/posts/CreatePostForBlogRequestView';
import { blogRepository } from '../repositories/blog-repository';
import { UpdatePostRequestView } from '../view';
import { postRepository } from '../repositories/post-repository';
import { Post } from '../dto/new-post-dto';

class PostService {
  async createPost(body: CreatePostForBlogRequestView, params: { blogId: string }): Promise<Result<string | null>> {
    try {

      const { status, data } = await blogRepository.getBlogById(params.blogId);

      if (status === ResultStatus.NotFound) {
        return { data: null, status: ResultStatus.NotFound };
      }

      const post = new Post(
        body.title,
        body.shortDescription,
        body.content,
        data!.name,
        data!.id);

      const { data: postId } = await postRepository.createPost(post);

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
      const { status, data } = await blogRepository.getBlogById(params.blogId);

      if (status === ResultStatus.NotFound) {
        return { data: null, status: ResultStatus.NotFound };
      }

      const post = new Post(
        body.title,
        body.shortDescription,
        body.content,
        data!.name,
        data!.id
      );

      const { data: postId } = await postRepository.createPost(post);

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
      const { status } = await postRepository.updatePostById(id, data);

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
      const { status } = await postRepository.deletePostById(id);

      return { data: null, status };

    } catch (error) {
      console.log(`Post not deleted: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };
}

export const postService = new PostService();
