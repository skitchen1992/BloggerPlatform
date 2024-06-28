import { mongoDBRepository } from '../repositories/db-repository';
import { usersCollection } from '../db/collection';
import { ResultStatus } from '../types/common/result';

export const deleteUserService = async (id: string) => {
  const deleteResult = await mongoDBRepository.delete(usersCollection, id);

  if (deleteResult.deletedCount === 1) {
    return { data: null, status: ResultStatus.Success };
  } else {
    return { data: null, status: ResultStatus.NotFound };
  }
};
