import { Result, ResultStatus } from '../types/common/result';
import { searchQueryBuilder } from '../utils/helpers';
import { EmailConfirmationWithId, GetUsersQuery } from '../types/users-types';
import { IUserSchema, UserModel } from '../models/user';
import { UserMapper } from '../mappers/user-mapper';
import { UserDTO } from '../dto/user-dto';
import { UserListDTO } from '../dto/user-list-dto';
import { ObjectId } from 'mongodb';
import { UpdateQuery } from 'mongoose';


class UserRepository {
  public async getUserById(id: string): Promise<Result<UserDTO | null>> {
    const user = await UserModel.findById(id).lean();

    return {
      data: user ? UserMapper.toUserDTO(user) : null,
      status: user ? ResultStatus.Success : ResultStatus.NotFound,
    };
  }

  public async getUserByFields(fields: (keyof IUserSchema)[], input: string | ObjectId): Promise<Result<IUserSchema | null>> {
    const queries = fields.map(field => ({ [field]: input }));

    const query = { $or: queries };

    const user = await UserModel.findOne(query).lean();

    if (user) {
      return { data: user, status: ResultStatus.Success };
    } else {
      return { data: null, status: ResultStatus.NotFound };
    }
  }

  async getUserByConfirmationCode(code: string) {
    try {
      const user = await UserModel.findOne({ 'emailConfirmation.confirmationCode': code }).lean();

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

    const users = await UserModel.find(filters.query).sort(filters.sort).skip(filters.skip).limit(filters.pageSize).lean();

    const totalCount = await UserModel.countDocuments(filters.query);

    const userList = users.map(user => (UserMapper.toUserDTO(user)));

    const result = new UserListDTO(userList, totalCount, filters.pageSize, filters.page);

    return { data: result, status: ResultStatus.Success };
  }

  public async isExistsUser(login: string, email: string) {
    const user = await UserModel.findOne({
      $or: [{ login }, { email }],
    }).lean()

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

  async updateUserById(id: string, data: UpdateQuery<IUserSchema>): Promise<Result<null>> {
    try {

      await UserModel.updateOne({ _id: new ObjectId(id) }, data);

      return { data: null, status: ResultStatus.Success };
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  async updateUserFieldById(id: string, field: string, data: unknown): Promise<Result<null>> {
    try {

      const updateResult = await UserModel.updateOne(
        { _id: id },
        { $set: { [field]: data } },
      );

      if (updateResult.modifiedCount === 1) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }

    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  public async createUser(obj: IUserSchema): Promise<Result<string | null>> {
    try {
      const data = new UserModel(obj);

      await data.save();

      return { data: data._id.toString(), status: ResultStatus.Success };
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  public async deleteUserById(id: string): Promise<Result<null>> {
    try {
      const blog = await UserModel.findByIdAndDelete(new ObjectId(id));

      if (blog) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.NotFound };
    }
  }

}

export const userRepository = new UserRepository();
