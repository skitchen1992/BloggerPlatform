import { CreateUserSchema } from '../view';
import { getUniqueId, hashBuilder } from '../utils/helpers';
import { Result, ResultStatus } from '../types/common/result';
import { add, getDateFromObjectId } from '../utils/dates/dates';
import { UserModel } from '../models/user';
import { ObjectId } from 'mongodb';
import { userRepository } from '../repositories/user-repository';

class UserService {
  async createUser(body: CreateUserSchema): Promise<Result<string | null>>  {
    try {
      const passwordHash = await hashBuilder.hash(body.password);

      const id = new ObjectId();

      const newUser = new UserModel({
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
      });

      const savedUser = await newUser.save();

      return { data: savedUser._id.toString(), status: ResultStatus.Success };

    } catch (error) {
      console.log(`User not created:  ${error}`);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  async deleteUserById(id: string): Promise<Result<null>> {
    try {
      const { status } = await userRepository.deleteUserById(id);

      if (status === ResultStatus.Success) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }
    } catch (error) {
      console.log(`User not deleted: ${error}`);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

}

export const userService = new UserService();

