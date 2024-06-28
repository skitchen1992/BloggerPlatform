import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { UpdatePostSchema } from '../../models';
import { RequestWithParamsAndBody } from '../../types/request-types';
import { updatePostService } from '../../services/update-post-service';
import { ResultStatus } from '../../types/common/result';

type RequestType = RequestWithParamsAndBody<UpdatePostSchema, { id: string }>;

export const updatePostController = async (req: RequestType, res: Response) => {
  try {
    const { status } = await updatePostService(req.params.id, req.body);

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
};
