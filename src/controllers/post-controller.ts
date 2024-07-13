import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
  RequestWithQueryAndParams,
} from '../types/request-types';
import { GetPostsQuery } from '../types/post-types';
import {
  CreatePostViewResponseView,
  CreatePostSchemaResponseView,
  GetPostListResponseView,
  GetPostResponseView,
  ResponseErrorResponseView,
  UpdatePostRequestView, CreateCommentRequestView, GetCommentListRequestView,
} from '../view-model';
import { HTTP_STATUSES } from '../utils/consts';
import { Response } from 'express';
import { ResultStatus } from '../types/common/result';
import { CreateCommentSchemaResponseView } from '../view-model/comments/CreateCommentSchemaResponseView';
import { CommentRepository } from '../repositories/comment-repository';
import { CommentService } from '../services/comment-service';
import { PostRepository } from '../repositories/post-repository';
import { PostService } from '../services/post-service';
import { LikeStatus, ParentType } from '../models/like';
import { LikeService } from '../services/like-service';

export class PostController {
  constructor(
    protected postRepository: PostRepository,
    protected postService: PostService,
    protected commentRepository: CommentRepository,
    protected commentService: CommentService,
    protected likeService: LikeService,
  ) {
  }

  async getPosts(req: RequestWithQuery<GetPostsQuery>, res: Response<GetPostListResponseView>) {
    try {
      const { data } = await this.postRepository.getPosts(req.query);

      res.status(HTTP_STATUSES.OK_200).json(data);
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };

  async getPostById(req: RequestWithParams<{
    id: string
  }>, res: Response<GetPostResponseView | ResponseErrorResponseView>) {
    try {
      const { data, status } = await this.postRepository.getPostById(req.params.id);

      if (status === ResultStatus.Success && data) {
        res.status(HTTP_STATUSES.OK_200).json(data);
      } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };

  async createPost(req: RequestWithBody<CreatePostViewResponseView>, res: Response<CreatePostSchemaResponseView | ResponseErrorResponseView>) {
    try {
      const {
        data: postId,
        status: postStatus,
      } = await this.postService.createPost(req.body, { blogId: req.body.blogId });

      if (postStatus === ResultStatus.Success && postId) {
        const { data, status } = await this.postRepository.getPostById(postId);

        if (status === ResultStatus.Success) {
          res.status(HTTP_STATUSES.CREATED_201).json(data!);
        }

        if (status === ResultStatus.NotFound) {
          res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
      }

      if (postStatus === ResultStatus.NotFound) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };

  async updatePost(req: RequestWithParamsAndBody<UpdatePostRequestView, { id: string }>, res: Response) {
    try {
      const { status } = await this.postService.updatePost(req.params.id, req.body);

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

  async deletePost(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { status } = await this.postService.deletePost(req.params.id);

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

  async createComment(
    req: RequestWithParamsAndBody<CreateCommentRequestView, { postId: string }>,
    res: Response<CreateCommentSchemaResponseView | ResponseErrorResponseView>,
  ) {
    try {
      const {
        data: commentId,
        status,
      } = await this.commentService.createComment(req.body, req.params, res.locals.user!);

      if (status === ResultStatus.Success && commentId) {
        const currentUserId = res.locals.user?.id.toString();

        await this.likeService.createLike(LikeStatus.NONE, currentUserId!, commentId, ParentType.COMMENT);

        const { data, status } = await this.commentRepository.getCommentForAuthUserById(commentId, currentUserId!);

        if (status === ResultStatus.Success) {
          res.status(HTTP_STATUSES.CREATED_201).json(data!);
        }

        if (status === ResultStatus.NotFound) {
          res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
      }

      if (status === ResultStatus.NotFound) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      }

      if (status === ResultStatus.BadRequest) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };

  async getCommentsForPost(
    req: RequestWithQueryAndParams<GetPostsQuery, { postId: string }>,
    res: Response<GetCommentListRequestView>,
  ) {
    try {
      const currentUserId = res.locals.user?.id.toString();

      const { data: comments } = await this.commentRepository.getComments(
        req.query,
        { postId: req.params.postId },
        currentUserId);

      res.status(HTTP_STATUSES.OK_200).json(comments);
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };
}
