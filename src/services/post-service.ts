import { ObjectId } from 'mongodb';
import { Result, ResultStatus } from '../types/common/result';
import { getDateFromObjectId } from '../utils/dates/dates';
import { CreatePostForBlogRequestView } from '../view/posts/CreatePostForBlogRequestView';
import { blogRepository } from '../repositories/blog-repository';
import { PostModel } from '../models/post';
import { CreateCommentRequestView, GetUserResponseView, UpdatePostRequestView } from '../view';
import { CommentModel } from '../models/comment';

class PostService {
  async createPost(body: CreatePostForBlogRequestView, params: { blogId: string }): Promise<Result<string | null>> {
    try {

      const { status, data } = await blogRepository.getBlogById(params.blogId);

      if (status === ResultStatus.NotFound) {
        return { data: null, status: ResultStatus.NotFound };
      }

      const id = new ObjectId();

      const newPost = new PostModel({
        title: body.title,
        shortDescription: body.shortDescription,
        content: body.content,
        blogName: data!.name,
        blogId: data!.id,
        createdAt: getDateFromObjectId(id),
        _id: id,
      });

      const savedPost = await newPost.save();

      return { data: savedPost._id.toString(), status: ResultStatus.Success };
    } catch (error) {
      console.log(`Post not created: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };

  async updatePost(id: string, data: UpdatePostRequestView) {
    try {
      const updateResult = await PostModel.updateOne({ _id: new ObjectId(id) }, data);

      if (updateResult.modifiedCount === 1) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }

    } catch (error) {
      console.log(`Post not updated: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };

  async deletePost(id: string) {
    try {
      const deleteResult = await PostModel.deleteOne({ _id: new ObjectId(id) });

      if (deleteResult.deletedCount === 1) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }

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

      const newComment = new CommentModel({
        content: body.content,
        commentatorInfo: {
          userId: user.id,
          userLogin: user.login,
        },
        postId: params.postId,
        createdAt: getDateFromObjectId(id),
        _id: id,
      });

      const savedComment = await newComment.save();

      return { data: savedComment._id.toString(), status: ResultStatus.Success };

    } catch (error) {
      console.log(`Comment not created: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };
}

export const postService = new PostService();
