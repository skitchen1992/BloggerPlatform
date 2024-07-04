import {  Response } from 'express';
import { RequestWithBody, RequestWithParams, RequestWithQuery } from '../types/request-types';
import { GetUsersQuery } from '../types/users-types';
import { userRepository } from '../repositories/user-repository';
import { HTTP_STATUSES } from '../utils/consts';
import { ResultStatus } from '../types/common/result';
import { CreateUserRequestView, CreateUserSchemaResponseView, ResponseErrorSchema } from '../view';
import { userService } from '../services/user-service';

class UserController {
  async getUsers(req: RequestWithQuery<GetUsersQuery>, res: Response) {
    try {
      const { data } = await userRepository.getUsers(req.query);

      res.status(HTTP_STATUSES.OK_200).json(data);
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  }

  async deleteUser(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { status } = await userService.deleteUserById(req.params.id);

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

  async createUser(req: RequestWithBody<CreateUserRequestView>, res: Response<CreateUserSchemaResponseView | ResponseErrorSchema>) {
    try {
      const { status } = await userRepository.isExistsUser(req.body.login, req.body.email);

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

      const { data: userId, status: userStatus } = await userService.createUser(req.body);

      if (userStatus === ResultStatus.Success && userId) {
        const { data: user } = await userRepository.getUserById(userId);

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

export const userController = new UserController();
