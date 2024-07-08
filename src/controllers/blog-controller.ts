import { Response } from 'express';
import {
  CreateBlogRequestView,
  CreateBlogSchemaResponseView,
  CreatePostSchemaResponseView,
  GetBlogListRequestView,
  GetBlogResponseView,
  GetPostListResponseView,
  ResponseErrorResponseView,
  UpdateBlogRequestView,
} from '../view';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
  RequestWithQueryAndParams,
} from '../types/request-types';
import { GetBlogsQuery } from '../types/blog-types';
import { HTTP_STATUSES } from '../utils/consts';
import { GetPostsQuery } from '../types/post-types';
import { ResultStatus } from '../types/common/result';
import { CreatePostForBlogRequestView } from '../view/posts/CreatePostForBlogRequestView';
import { blogRepository } from '../repositories/blog-repository';
import { postRepository } from '../repositories/post-repository';
import { blogService } from '../services/blog-service';
import { postService } from '../services/post-service';

class BlogController {
  async getBlogs(req: RequestWithQuery<GetBlogsQuery>, res: Response<GetBlogListRequestView>) {
    try {
      const { data } = await blogRepository.getBlogs(req.query);
      res.status(HTTP_STATUSES.OK_200).json(data);
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  }

  async getBlogById(req: RequestWithParams<{ id: string }>, res: Response<GetBlogResponseView | null>) {
    try {
      const { data, status } = await blogRepository.getBlogById(req.params.id);

      if (status === ResultStatus.Success) {
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
  }

  async getPostsForBlog(
    req: RequestWithQueryAndParams<GetPostsQuery, { blogId: string }>,
    res: Response<GetPostListResponseView>,
  ) {
    try {
      const { status } = await blogRepository.getBlogById(req.params.blogId);

      if (status !== ResultStatus.Success) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
      }

      const { data } = await postRepository.getPosts(req.query, req.params);
      res.status(HTTP_STATUSES.OK_200).json(data);
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  }

  async createBlog(req: RequestWithBody<CreateBlogRequestView>, res: Response<CreateBlogSchemaResponseView | ResponseErrorResponseView>) {
    try {
      const { data: blogId, status } = await blogService.createBlog(req.body);

      if (status === ResultStatus.Success && blogId) {
        const { data, status } = await blogRepository.getBlogById(blogId.toString());

        res.status(HTTP_STATUSES.CREATED_201).json(data!);
      }

      if (status === ResultStatus.BadRequest) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  }

  async createPostForBlog(
    req: RequestWithParamsAndBody<CreatePostForBlogRequestView, { blogId: string }>,
    res: Response<CreatePostSchemaResponseView | ResponseErrorResponseView>,
  ) {
    try {
      const { data: postId, status: blogStatus } = await postService.createPostForBlog(req.body, req.params);

      if (blogStatus === ResultStatus.NotFound) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
      }

      const { data: post, status: postStatus } = await postRepository.getPostById(postId!);

      if (postStatus === ResultStatus.Success) {
        res.status(HTTP_STATUSES.CREATED_201).json(post!);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  }

  async updateBlog(req: RequestWithParamsAndBody<UpdateBlogRequestView, { id: string }>, res: Response) {
    try {
      const { status } = await blogService.updateBlog(req.params.id, req.body);

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
  }

  async deleteBlog(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { status } = await blogService.deleteBlog(req.params.id);

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
  }
}

export const blogController = new BlogController();

