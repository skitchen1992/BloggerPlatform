import { ResultStatus } from '../types/common/result';
import { UpdateCommentRequestView } from '../view/comments/UpdateCommentRequestView';
import { commentRepository } from '../repositories/comment-repository';

class CommentService {

  async updateComment(id: string, data: UpdateCommentRequestView) {
    try {
      const { status } = await commentRepository.updateCommentById(id, data);

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
      const { status } = await commentRepository.deleteCommentById(id);
      return { data: null, status: status };

    } catch (error) {
      console.log(`Comment not deleted: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };
}

export const commentService = new CommentService();
