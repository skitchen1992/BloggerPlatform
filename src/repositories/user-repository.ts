import { Result, ResultStatus } from '../types/common/result';
import { searchQueryBuilder } from '../utils/helpers';
import { EmailConfirmationWithId, GetUsersQuery } from '../types/users-types';
import { IUserSchema, UserModel } from '../models/user';
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

  public async getUserByFields(fields: (keyof IUserSchema)[], input: string): Promise<Result<IUserSchema | null>> {
    const query = fields.reduce((acc, field) => {
      acc[field] = input;
      return acc;
    }, {} as { [key: string]: string });

    const user = await UserModel.findOne(query);

    if (user) {
      return { data: user, status: ResultStatus.Success };
    } else {
      return { data: null, status: ResultStatus.NotFound };
    }
  }

  async getUserByConfirmationCode(code: string) {
    try {
      const user = await UserModel.findOne({ 'emailConfirmation.confirmationCode': code });

      if (user && user.emailConfirmation) {
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
    } catch (error) {
      console.error('Error fetching user by confirmation code:', error);
      return { data: null, status: ResultStatus.BadRequest };
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
