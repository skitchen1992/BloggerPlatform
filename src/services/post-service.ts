import { ObjectId } from 'mongodb';
import { Result, ResultStatus } from '../types/common/result';
import { getDateFromObjectId } from '../utils/dates/dates';
import { CreatePostForBlogRequestView } from '../view/posts/CreatePostForBlogRequestView';
import { blogRepository } from '../repositories/blog-repository';
import { CreateCommentRequestView, GetUserResponseView, UpdatePostRequestView } from '../view';
import { ICommentSchema } from '../models/comment';
import { postRepository } from '../repositories/post-repository';
import { commentRepository } from '../repositories/comment-repository';

class PostService {
  async createPost(body: CreatePostForBlogRequestView, params: { blogId: string }): Promise<Result<string | null>> {
    try {

      const { status, data } = await blogRepository.getBlogById(params.blogId);

      if (status === ResultStatus.NotFound) {
        return { data: null, status: ResultStatus.NotFound };
      }

      const id = new ObjectId();

      const newPost = {
        title: body.title,
        shortDescription: body.shortDescription,
        content: body.content,
        blogName: data!.name,
        blogId: data!.id,
        createdAt: getDateFromObjectId(id),
        _id: id,
      };

      const { data: postId } = await postRepository.createPost(newPost);

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

  async createComment(
    body: CreateCommentRequestView,
    params: { postId: string },
    user: GetUserResponseView,
  ) {
    try {

      const id = new ObjectId();

      const newComment: ICommentSchema = {
        content: body.content,
        commentatorInfo: {
          userId: user.id,
          userLogin: user.login,
        },
        postId: params.postId,
        createdAt: getDateFromObjectId(id),
        _id: id,
      };

      const { data: commentId } = await commentRepository.createComment(newComment);

      return { data: commentId, status: ResultStatus.Success };

    } catch (error) {
      console.log(`Comment not created: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };
}

export const postService = new PostService();
