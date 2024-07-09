import { ICommentSchema } from '../models/comment';
import { CommentDTO, ILikesInfo } from '../dto/comment-dto';

export class CommentMapper {
  static toCommentDTO(comment: ICommentSchema, likesInfo: ILikesInfo): CommentDTO {
    return new CommentDTO(
      comment._id.toString(),
      comment.content,
      comment.commentatorInfo,
      comment.createdAt,
      likesInfo,
    );
  }
}
