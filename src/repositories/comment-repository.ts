import { ResultStatus } from '../types/common/result';
import { searchQueryBuilder } from '../utils/helpers';
import { GetCommentsQuery } from '../types/comments-types';
import { CommentModel } from '../models/comment';
import { CommentMapper } from '../mappers/comment-mapper';
import { CommentListDTO } from '../dto/comment-list-dto';

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
}

export const commentRepository = new CommentRepository();
