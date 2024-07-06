import { Router } from 'express';
import { getPostsQueryParams, PATH_URL } from '../utils/consts';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { checkExactMiddleware } from '../middlewares/check-exact-middleware';
import { validateCreatePostSchema, validateUpdatePostSchema } from '../middlewares/posts';
import { CreateCommentRequestView, CreatePostViewResponseView, UpdatePostRequestView } from '../view';
import { basicAuthMiddleware } from '../middlewares/basic-auth-middleware';
import { validateCreateCommentSchema } from '../middlewares/posts/validate-schemas/validate-create-comment-schema';
import { bearerTokenAuthMiddleware } from '../middlewares/bearer-token-auth-middleware';
import { checkBlogExistsMiddleware } from '../middlewares/check-blog-exists-middleware';
import { checkPostExistsMiddleware } from '../middlewares/check-post-exists-middleware';
import { postController } from '../controllers/post-controller';

export const postsRouter = Router();

postsRouter.get(
  PATH_URL.ROOT,
  sanitizerQueryMiddleware(getPostsQueryParams),
  errorHandlingMiddleware,
  postController.getPosts,
);

postsRouter.get(
  PATH_URL.ID,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  postController.getPostById,
);

postsRouter.post(
  PATH_URL.ROOT,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateCreatePostSchema),
  checkBlogExistsMiddleware.body('blogId'),
  errorHandlingMiddleware<CreatePostViewResponseView>,
  postController.createPost,
);

postsRouter.put(
  PATH_URL.ID,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateUpdatePostSchema),
  checkBlogExistsMiddleware.body('blogId'),
  errorHandlingMiddleware<UpdatePostRequestView>,
  postController.updatePost,
);

postsRouter.delete(
  PATH_URL.ID,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  postController.deletePost,
);

postsRouter.post(
  PATH_URL.COMMENT_FOR_POST,
  bearerTokenAuthMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateCreateCommentSchema),
  checkPostExistsMiddleware.urlParams('postId'),
  errorHandlingMiddleware<CreateCommentRequestView>,
  postController.createComment,
);

postsRouter.get(
  PATH_URL.COMMENT_FOR_POST,
  sanitizerQueryMiddleware(getPostsQueryParams),
  checkPostExistsMiddleware.urlParams('postId'),
  errorHandlingMiddleware,
  postController.getCommentsForPost,
);
