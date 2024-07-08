import { CreateBlogRequestView, UpdateBlogRequestView } from '../view-model';
import { Result, ResultStatus } from '../types/common/result';
import { Blog } from '../dto/new-blog-dto';
import { BlogRepository } from '../repositories/blog-repository';

export class BlogService {

  constructor(protected blogRepository: BlogRepository) {
  }

  async createBlog(body: CreateBlogRequestView): Promise<Result<string | null>> {
    try {
      const blog = new Blog(
        body.name,
        body.description,
        body.websiteUrl,
        false,
      );

      const { data: blogId } = await this.blogRepository.createBlog(blog);

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
      const { status } = await this.blogRepository.updateBlogById(id, data);

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
      const { status } = await this.blogRepository.deleteBlogById(id);

      return { data: null, status };
    } catch (error) {
      console.log(`Blog not deleted: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  }
}
