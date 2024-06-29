import { IBlogSchema } from '../models/blog';
import { BlogDTO } from '../dto/blog-dto';

export class BlogMapper {
  static toBlogDTO(blog: IBlogSchema): BlogDTO {
    return new BlogDTO(
      blog._id.toString(),
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt,
      blog.isMembership,
    );
  }
}
