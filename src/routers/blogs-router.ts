import { Router } from 'express';
import { getBlogsQueryParams, getPostsQueryParams, PATH_URL } from '../utils/consts';
import { validateBlogPostSchema, validateBlogPutSchema } from '../middlewares/blogs';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { basicAuthMiddleware } from '../middlewares/basic-auth-middleware';
import { CreateBlogSchema, UpdateBlogSchema } from '../Veiw';
import { CreatePostForBlogSchema } from '../Veiw/posts/CreatePostForBlogSchema';
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

blogsRouter.get(PATH_URL.ID,
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
  errorHandlingMiddleware<CreateBlogSchema>,
  blogController.createBlog,
);

blogsRouter.post(
  PATH_URL.POSTS_FOR_BLOG,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  validateCreatePostForBlogSchema(),
  errorHandlingMiddleware<CreatePostForBlogSchema>,
  blogController.createPostForBlog,
);

blogsRouter.put(
  PATH_URL.ID,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  validateBlogPutSchema(),
  errorHandlingMiddleware<UpdateBlogSchema>,
  blogController.updateBlog,
);

blogsRouter.delete(
  PATH_URL.ID,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  blogController.deleteBlog,
);
