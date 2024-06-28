import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { UpdateBlogSchema } from '../../models';
import { RequestWithParamsAndBody } from '../../types/request-types';
import { updateBlogService } from '../../services/update-blog-service';
import { ResultStatus } from '../../types/common/result';

type RequestType = RequestWithParamsAndBody<UpdateBlogSchema, { id: string }>;

export const updateBlogController = async (req: RequestType, res: Response) => {
  try {
    const { status } = await updateBlogService(req.params.id, req.body);

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
