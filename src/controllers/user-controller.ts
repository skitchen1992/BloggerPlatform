import { Response } from 'express';
import { RequestWithBody, RequestWithParams, RequestWithQuery } from '../types/request-types';
import { GetUsersQuery } from '../types/users-types';
import { UserRepository } from '../repositories/user-repository';
import { HTTP_STATUSES } from '../utils/consts';
import { ResultStatus } from '../types/common/result';
import { CreateUserRequestView, CreateUserSchemaResponseView, ResponseErrorResponseView } from '../view-model';
import { UserService } from '../services/user-service';

export class UserController {
  constructor(
    protected userRepository: UserRepository,
    protected userService: UserService,
  ) {
  }

  async getUsers(req: RequestWithQuery<GetUsersQuery>, res: Response) {
    try {
      const { data } = await this.userRepository.getUsers(req.query);

      res.status(HTTP_STATUSES.OK_200).json(data);
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  }

  async deleteUser(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { status } = await this.userService.deleteUserById(req.params.id);

      if (status === ResultStatus.Success) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        return;
      }
      if (status === ResultStatus.NotFound) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  }

  async createUser(req: RequestWithBody<CreateUserRequestView>, res: Response<CreateUserSchemaResponseView | ResponseErrorResponseView>) {
    try {
      const { status } = await this.userRepository.isExistsUser(req.body.login, req.body.email);

      if (status === ResultStatus.BadRequest) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
          errorsMessages: [
            {
              message: 'Email and login should be unique',
              field: 'email',
            },
          ],
        });
        return;
      }

      const { data: userId, status: userStatus } = await this.userService.createUser(req.body);

      if (userStatus === ResultStatus.Success && userId) {
        const { data: user } = await this.userRepository.getUserById(userId);

        res.status(HTTP_STATUSES.CREATED_201).json(user!);
        return;
      }

      if (userStatus === ResultStatus.BadRequest) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
      }
    } catch (error) {
      console.log(`User not created ${error}`);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  }
}
