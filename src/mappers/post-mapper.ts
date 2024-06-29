import { IPostSchema } from '../models/post';
import { PostDTO } from '../dto/post-dto';

export class PostMapper {
  static toPostDTO(post: IPostSchema): PostDTO {
    return new PostDTO(
      post._id.toString(),
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt,
    );
  }
}
