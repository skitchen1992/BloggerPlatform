import { mongoDBRepository } from '../repositories/db-repository';
import { usersCollection } from '../db/collection';
import { ResultStatus } from '../types/common/result';
import { UserDbType } from '../types/users-types';

export const updateUserConfirmationService = async (id: string, field: string, data: unknown) => {
  const updateResult = await mongoDBRepository.update<UserDbType>(usersCollection, id, {
    [field]: data,
  });

  if (updateResult.modifiedCount === 1) {
    return { status: ResultStatus.Success };
  } else {
    return { status: ResultStatus.NotFound };
  }
};
