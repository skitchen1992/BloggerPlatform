import { RequestWithParams, RequestWithParamsAndBody } from '../types/request-types';
import { GetCommentResponseView } from '../view-model';
import { HTTP_STATUSES } from '../utils/consts';
import { Response } from 'express';
import { ResultStatus } from '../types/common/result';
import { UpdateCommentRequestView } from '../view-model/comments/UpdateCommentRequestView';
import { CommentService } from '../services/comment-service';
import { CommentRepository } from '../repositories/comment-repository';
import { LikeService } from '../services/like-service';
import { CreateLikeRequestView } from '../view-model/likes/CreateLikeRequestView';
import { ParentType } from '../models/like';

export class CommentController {

  constructor(
    protected commentService: CommentService,
    protected commentRepository: CommentRepository,
    protected likeService: LikeService,
  ) {
  }

  async getCommentById(
    req: RequestWithParams<{ commentId: string }>,
    res: Response<GetCommentResponseView | null>,
  ) {
    try {
      const { data, status } = await this.commentRepository.getCommentById(req.params.commentId);

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

  async updateComment(req: RequestWithParamsAndBody<UpdateCommentRequestView, { commentId: string }>, res: Response) {
    try {
      const currentUserId = res.locals.user?.id.toString();

      const { status, data: comment } = await this.commentRepository.getCommentById(req.params.commentId);

      if (status === ResultStatus.NotFound) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
      }

      if (currentUserId !== comment!.commentatorInfo.userId.toString()) {
        res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
        return;
      }

      const { status: updateStatus } = await this.commentService.updateComment(req.params.commentId, req.body);

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

  async createLikeForComment(req: RequestWithParamsAndBody<CreateLikeRequestView, {
    commentId: string
  }>, res: Response) {
    try {
      const currentUserId = res.locals.user?.id.toString();

      const {
        data,
        status,
      } = await this.likeService.createLike(req.body.likeStatus, currentUserId!, req.params.commentId, ParentType.COMMENT);

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


  async deleteComment(req: RequestWithParams<{ commentId: string }>, res: Response) {
    try {
      const currentUserId = res.locals.user?.id.toString();

      const { status, data: comment } = await this.commentRepository.getCommentById(req.params.commentId);

      if (status === ResultStatus.NotFound) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
      }

      if (currentUserId !== comment?.commentatorInfo.userId.toString()) {
        res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
        return;
      }

      const { status: deleteStatus } = await this.commentService.deleteComment(req.params.commentId);

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
