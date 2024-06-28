import { UserDTO } from '../dto/user-dto';
import { IUserSchema } from '../models/user';

export class UserMapper {
  static toUserDTO(user: IUserSchema): UserDTO {
    return new UserDTO(
      user._id.toString(),
      user.login,
      user.email,
      user.createdAt,
    );
  }
}
