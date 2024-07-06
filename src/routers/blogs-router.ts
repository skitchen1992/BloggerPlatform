import { Router } from 'express';
import { getBlogsQueryParams, getPostsQueryParams, PATH_URL } from '../utils/consts';
import { validateBlogPostSchema, validateBlogPutSchema } from '../middlewares/blogs';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { basicAuthMiddleware } from '../middlewares/basic-auth-middleware';
import { CreateBlogRequestView, UpdateBlogRequestView } from '../view';
import { CreatePostForBlogRequestView } from '../view/posts/CreatePostForBlogRequestView';
import {
  validateCreatePostForBlogSchema,
} from '../middlewares/blogs/validate-schemas/validate-create-post-for-blog-schema';
import { blogController } from '../controllers/blog-controller';

export const blogsRouter = Router();

blogsRouter.get(
  PATH_URL.ROOT,
  sanitizerQueryMiddleware(getBlogsQueryParams),
  errorHandlingMiddleware,
  blogController.getBlogs,
);

blogsRouter.get(
  PATH_URL.ID,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  blogController.getBlogById,
);

blogsRouter.get(
  PATH_URL.POSTS_FOR_BLOG,
  sanitizerQueryMiddleware(getPostsQueryParams),
  errorHandlingMiddleware,
  blogController.getPostsForBlog,
);

blogsRouter.post(
  PATH_URL.ROOT,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  //remove for tests
  //checkExactMiddleware(validateUserPostSchema),
  validateBlogPostSchema(),
  errorHandlingMiddleware<CreateBlogRequestView>,
  blogController.createBlog,
);

blogsRouter.post(
  PATH_URL.POSTS_FOR_BLOG,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  validateCreatePostForBlogSchema(),
  errorHandlingMiddleware<CreatePostForBlogRequestView>,
  blogController.createPostForBlog,
);

blogsRouter.put(
  PATH_URL.ID,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  validateBlogPutSchema(),
  errorHandlingMiddleware<UpdateBlogRequestView>,
  blogController.updateBlog,
);

blogsRouter.delete(
  PATH_URL.ID,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  blogController.deleteBlog,
);
