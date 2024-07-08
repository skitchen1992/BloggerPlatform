import { Router } from 'express';
import { getBlogsQueryParams, getPostsQueryParams, PATH_URL } from '../utils/consts';
import { validateBlogPostSchema, validateBlogPutSchema } from '../middlewares/blogs';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { basicAuthMiddleware } from '../middlewares/basic-auth-middleware';
import { CreateBlogRequestView, UpdateBlogRequestView } from '../view-model';
import { CreatePostForBlogRequestView } from '../view-model/posts/CreatePostForBlogRequestView';
import {
  validateCreatePostForBlogSchema,
} from '../middlewares/blogs/validate-schemas/validate-create-post-for-blog-schema';
import { blogController } from '../compositions/composition-root';

export const blogsRouter = Router();

blogsRouter.get(
  PATH_URL.ROOT,
  sanitizerQueryMiddleware(getBlogsQueryParams),
  errorHandlingMiddleware,
  blogController.getBlogs.bind(blogController),
);

blogsRouter.get(
  PATH_URL.ID,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  blogController.getBlogById.bind(blogController),
);

blogsRouter.get(
  PATH_URL.POSTS_FOR_BLOG,
  sanitizerQueryMiddleware(getPostsQueryParams),
  errorHandlingMiddleware,
  blogController.getPostsForBlog.bind(blogController),
);

blogsRouter.post(
  PATH_URL.ROOT,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  //remove for tests
  //checkExactMiddleware(validateUserPostSchema),
  validateBlogPostSchema(),
  errorHandlingMiddleware<CreateBlogRequestView>,
  blogController.createBlog.bind(blogController),
);

blogsRouter.post(
  PATH_URL.POSTS_FOR_BLOG,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  validateCreatePostForBlogSchema(),
  errorHandlingMiddleware<CreatePostForBlogRequestView>,
  blogController.createPostForBlog.bind(blogController),
);

blogsRouter.put(
  PATH_URL.ID,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  validateBlogPutSchema(),
  errorHandlingMiddleware<UpdateBlogRequestView>,
  blogController.updateBlog.bind(blogController),
);

blogsRouter.delete(
  PATH_URL.ID,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  blogController.deleteBlog.bind(blogController),
);
