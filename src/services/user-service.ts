import { CreateUserRequestView } from '../view';
import { getUniqueId, hashBuilder } from '../utils/helpers';
import { Result, ResultStatus } from '../types/common/result';
import { add } from '../utils/dates/dates';
import { userRepository } from '../repositories/user-repository';
import { User } from '../dto/new-user-dto';

class UserService {
  async createUser(body: CreateUserRequestView): Promise<Result<string | null>> {
    try {
      const passwordHash = await hashBuilder.hash(body.password);

      const user = new User(
        body.login,
        passwordHash,
        body.email,
        {
          isConfirmed: false,
          confirmationCode: getUniqueId(),
          expirationDate: add(new Date(), { hours: 1 }),
        },
      );

      const { data: userId } = await userRepository.createUser(user);

      return { data: userId, status: ResultStatus.Success };

    } catch (error) {
      console.log(`User not created:  ${error}`);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  async deleteUserById(id: string): Promise<Result<null>> {
    try {
      const { status } = await userRepository.deleteUserById(id);

      return { data: null, status };
    } catch (error) {
      console.log(`User not deleted: ${error}`);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  async updateUserFieldById(id: string, field: string, data: unknown): Promise<Result<null>> {
    const { status } = await userRepository.updateUserFieldById(id, field, data);

    return { data: null, status };

  };

}

export const userService = new UserService();

