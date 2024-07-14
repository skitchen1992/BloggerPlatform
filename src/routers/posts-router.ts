import { Router } from 'express';
import { getPostsQueryParams, PATH_URL } from '../utils/consts';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { checkExactMiddleware } from '../middlewares/check-exact-middleware';
import { validateCreatePostSchema, validateUpdatePostSchema } from '../middlewares/posts';
import { CreateCommentRequestView, CreatePostViewResponseView, UpdatePostRequestView } from '../view-model';
import { basicAuthMiddleware } from '../middlewares/basic-auth-middleware';
import { validateCreateCommentSchema } from '../middlewares/posts/validate-schemas/validate-create-comment-schema';
import { bearerTokenAuthMiddleware } from '../middlewares/bearer-token-auth-middleware';
import { checkBlogExistsMiddleware } from '../middlewares/check-blog-exists-middleware';
import { checkPostExistsMiddleware } from '../middlewares/check-post-exists-middleware';
import { postController } from '../compositions/composition-root';
import { bearerTokenUserInterceptorMiddleware } from '../middlewares/bearer-token-user_interceptor-middleware';

export const postsRouter = Router();

postsRouter.get(
  PATH_URL.ROOT,
  bearerTokenUserInterceptorMiddleware,
  sanitizerQueryMiddleware(getPostsQueryParams),
  errorHandlingMiddleware,
  postController.getPosts.bind(postController),
);

postsRouter.get(
  PATH_URL.ID,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  postController.getPostById.bind(postController),
);

postsRouter.post(
  PATH_URL.ROOT,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateCreatePostSchema),
  checkBlogExistsMiddleware.body('blogId'),
  errorHandlingMiddleware<CreatePostViewResponseView>,
  postController.createPost.bind(postController),
);

postsRouter.put(
  PATH_URL.ID,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateUpdatePostSchema),
  checkBlogExistsMiddleware.body('blogId'),
  errorHandlingMiddleware<UpdatePostRequestView>,
  postController.updatePost.bind(postController),
);

postsRouter.delete(
  PATH_URL.ID,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  postController.deletePost.bind(postController),
);

postsRouter.post(
  PATH_URL.COMMENT_FOR_POST,
  bearerTokenAuthMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateCreateCommentSchema),
  checkPostExistsMiddleware.urlParams('postId'),
  errorHandlingMiddleware<CreateCommentRequestView>,
  postController.createComment.bind(postController),
);

postsRouter.get(
  PATH_URL.COMMENT_FOR_POST,
  bearerTokenUserInterceptorMiddleware,
  sanitizerQueryMiddleware(getPostsQueryParams),
  checkPostExistsMiddleware.urlParams('postId'),
  errorHandlingMiddleware,
  postController.getCommentsForPost.bind(postController),
);
