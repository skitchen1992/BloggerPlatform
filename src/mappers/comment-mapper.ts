import { ICommentSchema } from '../models/comment';
import { CommentDTO } from '../dto/comment-dto';

export class CommentMapper {
  static toCommentDTO(comment: ICommentSchema): CommentDTO {
    return new CommentDTO(
      comment._id.toString(),
      comment.title,
      comment.commentatorInfo,
      comment.createdAt,
    );
  }
}
