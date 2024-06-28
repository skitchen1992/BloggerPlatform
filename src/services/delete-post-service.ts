import { mongoDBRepository } from '../repositories/db-repository';
import { postsCollection } from '../db/collection';
import { ResultStatus } from '../types/common/result';

export const deletePostService = async (id: string) => {
  const deleteResult = await mongoDBRepository.delete(postsCollection, id);

  if (deleteResult.deletedCount === 1) {
    return { data: null, status: ResultStatus.Success };
  } else {
    return { data: null, status: ResultStatus.NotFound };
  }
};
