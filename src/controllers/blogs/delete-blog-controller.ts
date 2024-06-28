import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { RequestWithParams } from '../../types/request-types';
import { ResultStatus } from '../../types/common/result';
import { deleteBlogService } from '../../services/delete-blog-service';

type RequestType = RequestWithParams<{ id: string }>;

export const deleteBlogController = async (req: RequestType, res: Response) => {
  try {
    const { status } = await deleteBlogService(req.params.id);

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
  }
};
