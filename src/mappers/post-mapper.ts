import { IPostSchema } from '../models/post';
import { PostDTO } from '../dto/post-dto';
import { ExtendedLikesInfo } from '../view-model/posts/ExtendedLikesInfoView';

export class PostMapper {
  static toPostDTO(post: IPostSchema, extendedLikesInfo: ExtendedLikesInfo,): PostDTO {
    return new PostDTO(
      post._id.toString(),
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt,
      extendedLikesInfo
    );
  }
}
