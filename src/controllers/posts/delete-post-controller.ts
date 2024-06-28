import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { RequestWithParams } from '../../types/request-types';
import { deletePostService } from '../../services/delete-post-service';
import { ResultStatus } from '../../types/common/result';

type RequestType = RequestWithParams<{ id: string }>;

export const deletePostController = async (req: RequestType, res: Response) => {
  try {
    const { status } = await deletePostService(req.params.id);

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
