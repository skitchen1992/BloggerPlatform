import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { RequestWithParams } from '../../types/request-types';
import { GetCommentSchema } from '../../Veiw/comments/GetCommentSchema';
import { queryRepository } from '../../repositories/queryRepository';
import { ResultStatus } from '../../types/common/result';

type ResponseType = GetCommentSchema | null;

export const getCommentByIdController = async (
  req: RequestWithParams<{ commentId: string }>,
  res: Response<ResponseType>
) => {
  try {
    const { data, status } = await queryRepository.getCommentById(req.params.commentId);

    if (status === ResultStatus.Success) {
      res.status(HTTP_STATUSES.OK_200).json(data);
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
};
