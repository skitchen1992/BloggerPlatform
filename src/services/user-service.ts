import { CreateUserRequestView } from '../view';
import { getUniqueId, hashBuilder } from '../utils/helpers';
import { Result, ResultStatus } from '../types/common/result';
import { add, getDateFromObjectId } from '../utils/dates/dates';
import { IUserSchema } from '../models/user';
import { ObjectId } from 'mongodb';
import { userRepository } from '../repositories/user-repository';

class UserService {
  async createUser(body: CreateUserRequestView): Promise<Result<string | null>> {
    try {
      const passwordHash = await hashBuilder.hash(body.password);

      const id = new ObjectId();

      const newUser: IUserSchema = {
        login: body.login,
        password: passwordHash,
        email: body.email,
        createdAt: getDateFromObjectId(id),
        emailConfirmation: {
          isConfirmed: false,
          confirmationCode: getUniqueId(),
          expirationDate: add(new Date(), { hours: 1 }),
        },
        _id: id,
      };

      const { data: userId } = await userRepository.createUser(newUser);

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

