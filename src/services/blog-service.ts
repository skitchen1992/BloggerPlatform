import { CreateBlogSchema, UpdateBlogSchema } from '../Veiw';
import { BlogModel } from '../models/blog';
import { ObjectId } from 'mongodb';
import { Result, ResultStatus } from '../types/common/result';
import { getCurrentDate, getDateFromObjectId } from '../utils/dates/dates';
import { CreatePostForBlogSchema } from '../Veiw/posts/CreatePostForBlogSchema';
import { blogRepository } from '../repositories/blog-repository';
import { PostModel } from '../models/post';

class BlogService {
  async createBlog(body: CreateBlogSchema): Promise<Result<string | null>> {
    try {
      const id = new ObjectId();

      const newBlog = new BlogModel({
        name: body.name,
        description: body.description,
        websiteUrl: body.websiteUrl,
        createdAt: getDateFromObjectId(id),
        isMembership: false,
        _id: id,
      });

      const savedBlog = await newBlog.save();

      return { data: savedBlog._id.toString(), status: ResultStatus.Success };

    } catch (error) {
      console.log(`Blog not created: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  }

  async createPostForBlog(body: CreatePostForBlogSchema, params: { blogId: string }): Promise<Result<string | null>> {
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
        createdAt: getCurrentDate(),
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

  async updateBlog(id: string, data: UpdateBlogSchema): Promise<Result<null>> {
    try {

      const updateResult = await BlogModel.updateOne({ _id: new ObjectId(id) }, data);

      if (updateResult.modifiedCount === 1) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }
    } catch (error) {
      console.log(`Blog not updated: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  }

  async deleteBlog(id: string): Promise<Result<null>> {
    try {
      const deleteResult = await BlogModel.deleteOne({ _id: new ObjectId(id) });

      if (deleteResult.deletedCount === 1) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }
    } catch (error) {
      console.log(`Blog not deleted: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  }
}

export const blogService = new BlogService();
