import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { RequestWithParams } from '../../types/request-types';
import { queryRepository } from '../../repositories/queryRepository';
import { ResultStatus } from '../../types/common/result';
import { deleteCommentService } from '../../services/delete-comment-service';

type RequestType = RequestWithParams<{ commentId: string }>;

export const deleteCommentController = async (req: RequestType, res: Response) => {
  try {
    const currentUserId = res.locals.user?.id.toString();

    const { status, data: comment } = await queryRepository.getCommentById(req.params.commentId);

    if (status === ResultStatus.NotFound) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    if (currentUserId !== comment?.commentatorInfo.userId.toString()) {
      res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
      return;
    }

    const { status: deleteStatus } = await deleteCommentService(req.params.commentId);

    if (deleteStatus === ResultStatus.Success) {
      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
      return;
    }
    if (deleteStatus === ResultStatus.NotFound) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
