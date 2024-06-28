import { mongoDBRepository } from '../repositories/db-repository';
import { postsCollection } from '../db/collection';
import { ResultStatus } from '../types/common/result';
import { UpdatePostSchema } from '../models';

export const updatePostService = async (id: string, data: UpdatePostSchema) => {
  const updateResult = await mongoDBRepository.update(postsCollection, id, data);

  if (updateResult.modifiedCount === 1) {
    return { data: null, status: ResultStatus.Success };
  } else {
    return { data: null, status: ResultStatus.NotFound };
  }
};
