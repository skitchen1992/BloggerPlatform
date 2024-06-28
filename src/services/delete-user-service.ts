import { ResultStatus } from '../types/common/result';
import { userRepository } from '../repositories/user-repository';

export const deleteUserService = async (id: string) => {
  const { status } = await userRepository.deleteUserById(id);

  if (status === ResultStatus.Success) {
    return { data: null, status: ResultStatus.Success };
  } else {
    return { data: null, status: ResultStatus.NotFound };
  }
};
