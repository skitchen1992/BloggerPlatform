import { GetBlogsQuery } from '../types/blog-types';
import { Result, ResultStatus } from '../types/common/result';
import { searchQueryBuilder } from '../utils/helpers';
import { BlogModel, IBlogSchema } from '../models/blog';
import { BlogMapper } from '../mappers/blog-mapper';
import { BlogListDTO } from '../dto/blog-list-dto';
import { BlogDTO } from '../dto/blog-dto';
import { UpdateQuery } from 'mongoose';
import { ObjectId } from 'mongodb';

class BlogRepository {
  public async getBlogById(id: string): Promise<Result<BlogDTO | null>> {
    try {
      const blog = await BlogModel.findById(id);

      return {
        data: BlogMapper.toBlogDTO(blog!), status: ResultStatus.Success,
      };
    } catch (e) {
      return {
        data: null, status: ResultStatus.NotFound,
      };
    }
  }

  public async getBlogs(query: GetBlogsQuery): Promise<Result<BlogListDTO>> {
    const filters = searchQueryBuilder.getBlogs(query);

    const blogs = await BlogModel.find(filters.query).sort(filters.sort).skip(filters.skip).limit(filters.pageSize);

    const totalCount = await BlogModel.countDocuments(filters.query);

    const blogList = blogs.map(blog => (BlogMapper.toBlogDTO(blog)));

    const result = new BlogListDTO(blogList, totalCount, filters.pageSize, filters.page);

    return { data: result, status: ResultStatus.Success };

  }

  public async createBlog(obj: IBlogSchema): Promise<Result<string | null>> {
    try {
      const data = new BlogModel(obj);

      await data.save();

      return { data: data._id.toString(), status: ResultStatus.Success };
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  public async updateBlogById(id: string, data: UpdateQuery<IBlogSchema>): Promise<Result<null>> {
    try {

      const updateResult = await BlogModel.updateOne({ _id: new ObjectId(id) }, data);

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

  public async deleteBlogById(id: string): Promise<Result<null>> {
    try {
      const blog = await BlogModel.findByIdAndDelete(new ObjectId(id));

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

export const blogRepository = new BlogRepository();
