import { CreateUserRequestView } from '../view-model';
import { hashBuilder } from '../utils/helpers';
import { Result, ResultStatus } from '../types/common/result';
import { User } from '../dto/new-user-dto';
import { UserRepository } from '../repositories/user-repository';

export class UserService {
  constructor(protected userRepository: UserRepository) {
  }

  async createUser(body: CreateUserRequestView): Promise<Result<string | null>> {
    try {
      const passwordHash = await hashBuilder.hash(body.password);

      const user = new User(
        body.login,
        passwordHash,
        body.email,
      );

      const { data: userId } = await this.userRepository.createUser(user);

      return { data: userId, status: ResultStatus.Success };

    } catch (error) {
      console.log(`User not created:  ${error}`);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  async deleteUserById(id: string): Promise<Result<null>> {
    try {
      const { status } = await this.userRepository.deleteUserById(id);

      return { data: null, status };
    } catch (error) {
      console.log(`User not deleted: ${error}`);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  async updateUserFieldById(id: string, field: string, data: unknown): Promise<Result<null>> {
    const { status } = await this.userRepository.updateUserFieldById(id, field, data);

    return { data: null, status };

  };

}
