import { CreateUserSchema } from '../Veiw';
import { getUniqueId, hashBuilder } from '../utils/helpers';
import { ResultStatus } from '../types/common/result';
import { add, getDateFromObjectId } from '../utils/dates/dates';
import { UserModel } from '../models/user';
import { ObjectId } from 'mongodb';

class UserService {
  async createUser(body: CreateUserSchema) {
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
      console.log(`User not saved:  ${error}`);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }
}

export const userService = new UserService();

