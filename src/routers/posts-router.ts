import { Router } from 'express';
import { getPostsQueryParams, PATH_URL } from '../utils/consts';
import * as controllers from '../controllers';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { checkExactMiddleware } from '../middlewares/check-exact-middleware';
import { validateCreatePostSchema, validateUpdatePostSchema } from '../middlewares/posts';
import { CreateCommentSchema, CreatePostSchema, UpdatePostSchema } from '../models';
import { basicAuthMiddleware } from '../middlewares/basic-auth-middleware';
import { validateCreateCommentSchema } from '../middlewares/posts/validate-schemas/validate-create-comment-schema';
import { bearerTokenAuthMiddleware } from '../middlewares/bearer-token-auth-middleware';
import { checkBlogExistsMiddleware } from '../middlewares/check-blog-exists-middleware';
import { checkPostExistsMiddleware } from '../middlewares/check-post-exists-middleware';

export const postsRouter = Router();

postsRouter.get(
  PATH_URL.ROOT,
  sanitizerQueryMiddleware(getPostsQueryParams),
  errorHandlingMiddleware,
  controllers.getPostsController
);

postsRouter.get(PATH_URL.ID, sanitizerQueryMiddleware(), errorHandlingMiddleware, controllers.getPostByIdController);

postsRouter.post(
  PATH_URL.ROOT,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateCreatePostSchema),
  checkBlogExistsMiddleware.body('blogId'),
  errorHandlingMiddleware<CreatePostSchema>,
  controllers.createPostController
);

postsRouter.put(
  PATH_URL.ID,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateUpdatePostSchema),
  checkBlogExistsMiddleware.body('blogId'),
  errorHandlingMiddleware<UpdatePostSchema>,
  controllers.updatePostController
);

postsRouter.delete(
  PATH_URL.ID,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  controllers.deletePostController
);

postsRouter.post(
  PATH_URL.COMMENT_FOR_POST,
  bearerTokenAuthMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateCreateCommentSchema),
  checkPostExistsMiddleware.urlParams('postId'),
  errorHandlingMiddleware<CreateCommentSchema>,
  controllers.createCommentController
);

postsRouter.get(
  PATH_URL.COMMENT_FOR_POST,
  sanitizerQueryMiddleware(getPostsQueryParams),
  checkPostExistsMiddleware.urlParams('postId'),
  errorHandlingMiddleware,
  controllers.getCommentsForPostController
);
