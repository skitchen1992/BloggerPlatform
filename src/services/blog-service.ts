import { CreateBlogRequestView, UpdateBlogRequestView } from '../view';
import { Result, ResultStatus } from '../types/common/result';
import { blogRepository } from '../repositories/blog-repository';
import { Blog } from '../dto/new-blog-dto';

class BlogService {
  async createBlog(body: CreateBlogRequestView): Promise<Result<string | null>> {
    try {
      const blog = new Blog(
        body.name,
        body.description,
        body.websiteUrl,
        false,
      );

      const { data: blogId } = await blogRepository.createBlog(blog);

      return { data: blogId, status: ResultStatus.Success };

    } catch (error) {
      console.log(`Blog not created: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  }

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
