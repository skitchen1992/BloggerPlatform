import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { CreateCommentSchema, ResponseErrorSchema } from '../../Veiw';
import { RequestWithParamsAndBody } from '../../types/request-types';
import { CreateCommentSchemaResponse } from '../../Veiw/comments/CreateCommentSchemaResponse';
import { createCommentService } from '../../services/create-comment-service';
import { queryRepository } from '../../repositories/queryRepository';
import { ResultStatus } from '../../types/common/result';

type ResponseType = CreateCommentSchemaResponse | ResponseErrorSchema;

export const createCommentController = async (
  req: RequestWithParamsAndBody<CreateCommentSchema, { postId: string }>,
  res: Response<ResponseType>
) => {
  try {
    const { data: commentIdObj, status } = await createCommentService(req.body, req.params, res.locals.user!);

    if (status === ResultStatus.Success) {
      const { data, status } = await queryRepository.getCommentById(commentIdObj!.toString());

      if (status === ResultStatus.Success) {
        res.status(HTTP_STATUSES.CREATED_201).json(data!);
      }

      if (status === ResultStatus.NotFound) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      }
    }

    if (status === ResultStatus.NotFound) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    return;
  }
};
