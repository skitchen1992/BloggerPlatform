import { usersCollection } from '../db/collection';
import { Result, ResultStatus } from '../types/common/result';
import { searchQueryBuilder } from '../utils/helpers';
import { EmailConfirmationWithId, GetUsersQuery, IUserByEmail, UserDbType } from '../types/users-types';
import { mongoDBRepository } from './db-repository';
import { UserModel } from '../models/user';
import { UserMapper } from '../mappers/user-mapper';
import { UserDTO } from '../dto/user-dto';
import { UserListDTO } from '../dto/user-list-dto';


class UserRepository {
  public async getUserById(id: string): Promise<Result<UserDTO | null>> {
    const user = await UserModel.findById(id);

    return {
      data: user ? UserMapper.toUserDTO(user) : null,
      status: user ? ResultStatus.Success : ResultStatus.NotFound,
    };
  }

  public async getUserByEmail(email: string) {
    const user = await mongoDBRepository.getByField<UserDbType>(usersCollection, ['email'], email);

    if (user && user.emailConfirmation) {
      const data: IUserByEmail = {
        confirmationCode: user.emailConfirmation.confirmationCode,
        expirationDate: user.emailConfirmation.expirationDate,
        isConfirmed: user.emailConfirmation.isConfirmed,
        email: user.email,
        id: user._id.toString(),
      };
      return { data: data, status: ResultStatus.Success };
    } else {
      return { data: null, status: ResultStatus.NotFound };
    }
  }

  public async getUserByFields(fields: string[], input: string) {
    const user = await mongoDBRepository.getByField<UserDbType>(usersCollection, fields, input);

    if (user) {
      return { data: user, status: ResultStatus.Success };
    } else {
      return { data: null, status: ResultStatus.NotFound };
    }
  }

  public async getUserByConfirmationCode(code: string) {
    const user = await mongoDBRepository.getByField<UserDbType>(
      usersCollection,
      ['emailConfirmation.confirmationCode'],
      code,
    );

    if (user?.emailConfirmation) {
      const data: EmailConfirmationWithId = {
        confirmationCode: user.emailConfirmation.confirmationCode,
        expirationDate: user.emailConfirmation.expirationDate,
        isConfirmed: user.emailConfirmation.isConfirmed,
        id: user._id.toString(),
      };
      return { data: data, status: ResultStatus.Success };
    } else {
      return { data: null, status: ResultStatus.NotFound };
    }
  }

  public async getUsers(query: GetUsersQuery): Promise<Result<UserListDTO>> {
    const filters = searchQueryBuilder.getUsers(query);

    const users = await UserModel.find(filters.query);

    const totalCount = await UserModel.countDocuments(filters.query);

    const userList = users.map(user => (UserMapper.toUserDTO(user)));

    const result = new UserListDTO(userList, totalCount, filters.pageSize, filters.page);

    return { data: result, status: ResultStatus.Success };
  }

  public async deleteUserById(id: string): Promise<Result<null>> {
    const user = await UserModel.findByIdAndDelete(id);

    return {
      data: null,
      status: user ? ResultStatus.Success : ResultStatus.NotFound,
    };
  }

  public async getUserConfirmationData(id: string) {
    const user = await mongoDBRepository.getById<UserDbType>(usersCollection, id);

    return {
      data: user?.emailConfirmation,
      status: user?.emailConfirmation ? ResultStatus.Success : ResultStatus.NotFound,
    };
  }

  public async isExistsUser(login: string, email: string) {
    const user = await UserModel.findOne({
      $or: [{ login }, { email }],
    });

    if (user) {
      return {
        data: user.login === login ? 'login' : 'email',
        status: ResultStatus.BadRequest,
      };
    } else {
      return {
        data: null,
        status: ResultStatus.Success,
      };
    }
  }

}

export const userRepository = new UserRepository();
