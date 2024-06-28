import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { RequestWithParamsAndBody } from '../../types/request-types';
import { UpdateCommentSchema } from '../../models/comments/UpdateCommentSchema';
import { queryRepository } from '../../repositories/queryRepository';
import { ResultStatus } from '../../types/common/result';
import { updateCommentService } from '../../services/update-comment-service';

type RequestType = RequestWithParamsAndBody<UpdateCommentSchema, { commentId: string }>;

export const updateCommentController = async (req: RequestType, res: Response) => {
  try {
    const currentUserId = res.locals.user?.id.toString();

    const { status, data: comment } = await queryRepository.getCommentById(req.params.commentId);

    if (status === ResultStatus.NotFound) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    if (currentUserId !== comment!.commentatorInfo.userId.toString()) {
      res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
      return;
    }

    const { status: updateStatus } = await updateCommentService(req.params.commentId, req.body);

    if (updateStatus === ResultStatus.Success) {
      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
      return;
    }
    if (updateStatus === ResultStatus.NotFound) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
