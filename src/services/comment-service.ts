import { ResultStatus } from '../types/common/result';
import { UpdateCommentRequestView } from '../view/comments/UpdateCommentRequestView';
import { CreateCommentRequestView, GetUserResponseView } from '../view';
import { Comment } from '../dto/new-comment-dto';
import { CommentRepository } from '../repositories/comment-repository';

export class CommentService {

  constructor(protected commentRepository: CommentRepository) {
  }

  async createComment(
    body: CreateCommentRequestView,
    params: { postId: string },
    user: GetUserResponseView,
  ) {
    try {
      const comment = new Comment(
        body.content,
        { userId: user.id, userLogin: user.login },
        params.postId,
      );

      const { data: commentId } = await this.commentRepository.createComment(comment);

      return { data: commentId, status: ResultStatus.Success };

    } catch (error) {
      console.log(`Comment not created: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };

  async updateComment(id: string, data: UpdateCommentRequestView) {
    try {
      const { status } = await this.commentRepository.updateCommentById(id, data);

      return { data: null, status: status };
    } catch (error) {
      console.log(`Comment not updated: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };

  async deleteComment(id: string) {
    try {
      const { status } = await this.commentRepository.deleteCommentById(id);
      return { data: null, status: status };

    } catch (error) {
      console.log(`Comment not deleted: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };
}
