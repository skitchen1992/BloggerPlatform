import { ObjectId } from 'mongodb';
import { ResultStatus } from '../types/common/result';
import { CommentModel } from '../models/comment';
import { UpdateCommentSchema } from '../view/comments/UpdateCommentSchema';

class CommentService {

  async updateComment(id: string, data: UpdateCommentSchema) {
    try {
      const updateResult = await CommentModel.updateOne({ _id: new ObjectId(id) }, data);

      if (updateResult.modifiedCount === 1) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }

    } catch (error) {
      console.log(`Comment not updated: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };

  async deleteComment(id: string) {
    try {
      const deleteResult = await CommentModel.deleteOne({ _id: new ObjectId(id) });

      if (deleteResult.deletedCount === 1) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }

    } catch (error) {
      console.log(`Comment not deleted: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };

}

export const commentService = new CommentService();
