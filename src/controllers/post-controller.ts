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
} from '../view';
import { HTTP_STATUSES } from '../utils/consts';
import { Response } from 'express';
import { postRepository } from '../repositories/post-repository';
import { ResultStatus } from '../types/common/result';
import { postService } from '../services/post-service';
import { CreateCommentSchemaResponseView } from '../view/comments/CreateCommentSchemaResponseView';
import { commentRepository } from '../repositories/comment-repository';

class PostController {
  async getPosts(req: RequestWithQuery<GetPostsQuery>, res: Response<GetPostListResponseView>) {
    try {
      const { data } = await postRepository.getPosts(req.query);

      res.status(HTTP_STATUSES.OK_200).json(data);
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };

  async getPostById(req: RequestWithParams<{ id: string }>, res: Response<GetPostResponseView | ResponseErrorResponseView>) {
    try {
      const { data, status } = await postRepository.getPostById(req.params.id);

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
      } = await postService.createPost(req.body, { blogId: req.body.blogId });

      if (postStatus === ResultStatus.Success && postId) {
        const { data, status } = await postRepository.getPostById(postId);

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
      const { status } = await postService.updatePost(req.params.id, req.body);

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
      const { status } = await postService.deletePost(req.params.id);

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
      const { data: commentId, status } = await postService.createComment(req.body, req.params, res.locals.user!);

      if (status === ResultStatus.Success && commentId) {
        const { data, status } = await commentRepository.getCommentById(commentId);

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
      const { data: comments } = await commentRepository.getComments(req.query, { postId: req.params.postId });

      res.status(HTTP_STATUSES.OK_200).json(comments);
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };
}

export const postController = new PostController();
