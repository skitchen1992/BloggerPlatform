import { CreateBlogRequestView, UpdateBlogRequestView } from '../view';
import { ObjectId } from 'mongodb';
import { Result, ResultStatus } from '../types/common/result';
import { getDateFromObjectId } from '../utils/dates/dates';
import { CreatePostForBlogRequestView } from '../view/posts/CreatePostForBlogRequestView';
import { blogRepository } from '../repositories/blog-repository';
import { postRepository } from '../repositories/post-repository';

class BlogService {
  async createBlog(body: CreateBlogRequestView): Promise<Result<string | null>> {
    try {
      const id = new ObjectId();

      const newBlog = {
        name: body.name,
        description: body.description,
        websiteUrl: body.websiteUrl,
        createdAt: getDateFromObjectId(id),
        isMembership: false,
        _id: id,
      };

      const { data: blogId } = await blogRepository.createBlog(newBlog);


      return { data: blogId, status: ResultStatus.Success };

    } catch (error) {
      console.log(`Blog not created: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  }

  async createPostForBlog(body: CreatePostForBlogRequestView, params: {
    blogId: string
  }): Promise<Result<string | null>> {
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

  async updateBlog(id: string, data: UpdateBlogRequestView): Promise<Result<null>> {
    try {
      const { status } = await blogRepository.updateBlogById(id, data);

      return { data: null, status };
    } catch (error) {
      console.log(`Blog not updated: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  }

  async deleteBlog(id: string): Promise<Result<null>> {
    try {
      const { status } = await blogRepository.deleteBlogById(id);

      return { data: null, status };
    } catch (error) {
      console.log(`Blog not deleted: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  }
}

export const blogService = new BlogService();
