import { Result, ResultStatus } from '../types/common/result';
import { searchQueryBuilder } from '../utils/helpers';
import { GetCommentsQuery } from '../types/comments-types';
import { CommentModel, ICommentSchema } from '../models/comment';
import { CommentMapper } from '../mappers/comment-mapper';
import { CommentListDTO } from '../dto/comment-list-dto';
import { UpdateQuery } from 'mongoose';
import { ObjectId } from 'mongodb';

class CommentRepository {
  public async getCommentById(id: string) {
    const comment = await CommentModel.findById(id).lean();

    return {
      data: comment ? CommentMapper.toCommentDTO(comment) : null,
      status: comment ? ResultStatus.Success : ResultStatus.NotFound,
    };
  }

  public async getComments(
    query: GetCommentsQuery,
    params: { postId: string },
  ) {
    const filters = searchQueryBuilder.getComments(query, params);

    const comments = await CommentModel.find(filters.query).sort(filters.sort).skip(filters.skip).limit(filters.pageSize).lean();

    const totalCount = await CommentModel.countDocuments(filters.query);

    const commentList = comments.map(comment => (CommentMapper.toCommentDTO(comment)));

    const result = new CommentListDTO(commentList, totalCount, filters.pageSize, filters.page);

    return { data: result, status: ResultStatus.Success };
  }

  public async updateCommentById(id: string, data: UpdateQuery<ICommentSchema>): Promise<Result<null>> {
    try {

      const updateResult = await CommentModel.updateOne({ _id: new ObjectId(id) }, data);

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

  public async deleteCommentById(id: string): Promise<Result<null>> {
    try {
      const comment = await CommentModel.findByIdAndDelete(new ObjectId(id));

      if (comment) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.NotFound };
    }
  }

  public async createComment(obj: ICommentSchema): Promise<Result<string | null>> {
    try {
      const data = new CommentModel(obj);

      await data.save();

      return { data: data._id.toString(), status: ResultStatus.Success };
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }
}

export const commentRepository = new CommentRepository();
