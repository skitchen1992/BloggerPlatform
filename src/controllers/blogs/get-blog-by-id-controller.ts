import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { GetBlogSchema } from '../../models';
import { RequestWithParams } from '../../types/request-types';
import { queryRepository } from '../../repositories/queryRepository';
import { ResultStatus } from '../../types/common/result';

type ResponseType = GetBlogSchema | null;

export const getBlogByIdController = async (req: RequestWithParams<{ id: string }>, res: Response<ResponseType>) => {
  try {
    const { data, status } = await queryRepository.getBlogById(req.params.id);

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
