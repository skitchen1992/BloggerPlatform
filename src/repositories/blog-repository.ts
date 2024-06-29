import {  GetBlogsQuery } from '../types/blog-types';
import { Result, ResultStatus } from '../types/common/result';
import {  searchQueryBuilder } from '../utils/helpers';
import { BlogModel } from '../models/blog';
import { BlogMapper } from '../mappers/blog-mapper';
import { BlogListDTO } from '../dto/blog-list-dto';
import { BlogDTO } from '../dto/blog-dto';


class BlogRepository {
  public async getBlogById(id: string): Promise<Result<BlogDTO | null>>  {

    const blog = await BlogModel.findById(id);

    return {
      data: blog ? BlogMapper.toBlogDTO(blog) : null,
      status: blog ? ResultStatus.Success : ResultStatus.NotFound,
    };
  }

  public async getBlogs(query: GetBlogsQuery): Promise<Result<BlogListDTO>> {
    const filters = searchQueryBuilder.getBlogs(query);

    const blogs = await BlogModel.find(filters.query);

    const totalCount = await BlogModel.countDocuments(filters.query);

    const blogList = blogs.map(blog => (BlogMapper.toBlogDTO(blog)));

    const result = new BlogListDTO(blogList, totalCount, filters.pageSize, filters.page);

    return { data: result, status: ResultStatus.Success };

  }
}

export const blogRepository = new BlogRepository();
