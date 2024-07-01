import { RequestWithParams, RequestWithParamsAndBody } from '../types/request-types';
import { GetCommentSchema } from '../view';
import { HTTP_STATUSES } from '../utils/consts';
import { Response } from 'express';
import { ResultStatus } from '../types/common/result';
import { commentRepository } from '../repositories/comment-repository';
import { UpdateCommentSchema } from '../view/comments/UpdateCommentSchema';
import { commentService } from '../services/comment-service';

class CommentController {
  async getCommentById(
    req: RequestWithParams<{ commentId: string }>,
    res: Response<GetCommentSchema | null>,
  ) {
    try {
      const { data, status } = await commentRepository.getCommentById(req.params.commentId);

      if (status === ResultStatus.Success && data) {
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

  async updateComment(req: RequestWithParamsAndBody<UpdateCommentSchema, { commentId: string }>, res: Response) {
    try {
      const currentUserId = res.locals.user?.id.toString();

      const { status, data: comment } = await commentRepository.getCommentById(req.params.commentId);

      if (status === ResultStatus.NotFound) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
      }

      if (currentUserId !== comment!.commentatorInfo.userId.toString()) {
        res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
        return;
      }

      const { status: updateStatus } = await commentService.updateComment(req.params.commentId, req.body);

      if (updateStatus === ResultStatus.Success) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        return;
      }
      if (updateStatus === ResultStatus.NotFound) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
      }
      if (updateStatus === ResultStatus.BadRequest) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
        return;
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };

  async deleteComment(req: RequestWithParams<{ commentId: string }>, res: Response) {
    try {
      const currentUserId = res.locals.user?.id.toString();

      const { status, data: comment } = await commentRepository.getCommentById(req.params.commentId);

      if (status === ResultStatus.NotFound) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
      }

      if (currentUserId !== comment?.commentatorInfo.userId.toString()) {
        res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
        return;
      }

      const { status: deleteStatus } = await commentService.deleteComment(req.params.commentId);

      if (deleteStatus === ResultStatus.Success) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        return;
      }
      if (deleteStatus === ResultStatus.NotFound) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
      }
      if (deleteStatus === ResultStatus.BadRequest) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
        return;
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };
}

export const commentController = new CommentController();
