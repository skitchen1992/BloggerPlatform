import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { CreateUserSchema, CreateUserSchemaResponse, ResponseErrorSchema } from '../../Veiw';
import { RequestWithBody } from '../../types/request-types';
import { ResultStatus } from '../../types/common/result';
import { userService } from '../../services/create-user-service';
import { userRepository } from '../../repositories/user-repository';

type ResponseType = CreateUserSchemaResponse | ResponseErrorSchema;

export const createUserController = async (req: RequestWithBody<CreateUserSchema>, res: Response<ResponseType>) => {
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
    }

    if (userStatus === ResultStatus.BadRequest) {
      res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
    }
  } catch (error) {
    console.log(`User not created ${error}`);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
