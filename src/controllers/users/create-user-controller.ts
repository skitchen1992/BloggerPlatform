import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { CreateUserSchema, CreateUserSchemaResponse, ResponseErrorSchema } from '../../models';
import { RequestWithBody } from '../../types/request-types';
import { createUserService } from '../../services/create-user-service';
import { queryRepository } from '../../repositories/queryRepository';
import { ResultStatus } from '../../types/common/result';

type ResponseType = CreateUserSchemaResponse | ResponseErrorSchema;

export const createUserController = async (req: RequestWithBody<CreateUserSchema>, res: Response<ResponseType>) => {
  try {
    const { status } = await queryRepository.isExistsUser(req.body.login, req.body.email);

    if (status === ResultStatus.BagRequest) {
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

    const { data: userId, status: getUserStatus } = await createUserService(req.body);

    if (getUserStatus === ResultStatus.Success) {
      const { data, status } = await queryRepository.getUserById(userId!);

      if (status === ResultStatus.Success) {
        res.status(HTTP_STATUSES.CREATED_201).json(data!);
      }

      if (status === ResultStatus.NotFound) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      }
    }

    if (getUserStatus === ResultStatus.BagRequest) {
      res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
