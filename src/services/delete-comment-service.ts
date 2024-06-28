import { mongoDBRepository } from '../repositories/db-repository';
import { commentsCollection } from '../db/collection';
import { ResultStatus } from '../types/common/result';

export const deleteCommentService = async (id: string) => {
  const deleteResult = await mongoDBRepository.delete(commentsCollection, id);

  if (deleteResult.deletedCount === 1) {
    return { data: null, status: ResultStatus.Success };
  } else {
    return { data: null, status: ResultStatus.NotFound };
  }
};
