import { mongoDBRepository } from '../repositories/db-repository';
import { commentsCollection } from '../db/collection';
import { ResultStatus } from '../types/common/result';
import { CommentDbType } from '../types/comments-types';
import { UpdateCommentSchema } from '../Veiw/comments/UpdateCommentSchema';

export const updateCommentService = async (id: string, data: UpdateCommentSchema) => {
  const updateResult = await mongoDBRepository.update<CommentDbType>(commentsCollection, id, data);

  if (updateResult.modifiedCount === 1) {
    return { data: null, status: ResultStatus.Success };
  } else {
    return { data: null, status: ResultStatus.NotFound };
  }
};
