import { Router } from 'express';
import { PATH_URL } from '../utils/consts';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { checkExactMiddleware } from '../middlewares/check-exact-middleware';
import { UpdateCommentRequestView } from '../view-model/comments/UpdateCommentRequestView';
import { bearerTokenAuthMiddleware } from '../middlewares/bearer-token-auth-middleware';
import { validateCommentsPutSchema } from '../middlewares/comments';
import { commentController } from '../compositions/composition-root';
import { checkCommentExistsMiddleware } from '../middlewares/check-comment-exists-middleware';
import {
  validateCommentsPutLikeStatusSchema
} from '../middlewares/comments/validate-schemas/validate-comments-put-like-status-schema';
import { bearerTokenUserInterceptorMiddleware } from '../middlewares/bearer-token-user_interceptor-middleware';

export const commentsRouter = Router();

commentsRouter.get(
  PATH_URL.COMMENT_ID,
  //!!!!!!!
  bearerTokenUserInterceptorMiddleware,
  checkCommentExistsMiddleware.urlParams('commentId'),
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  commentController.getCommentById.bind(commentController)
);

commentsRouter.put(
  PATH_URL.COMMENT_ID,
  bearerTokenAuthMiddleware,
  checkCommentExistsMiddleware.urlParams('commentId'),
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateCommentsPutSchema),
  errorHandlingMiddleware<UpdateCommentRequestView>,
  commentController.updateComment.bind(commentController)
);

commentsRouter.delete(
  PATH_URL.COMMENT_ID,
  bearerTokenAuthMiddleware,
  checkCommentExistsMiddleware.urlParams('commentId'),
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  commentController.deleteComment.bind(commentController)
);

commentsRouter.put(
  PATH_URL.LIKE_STATUS,
  bearerTokenAuthMiddleware,
  checkCommentExistsMiddleware.urlParams('commentId'),
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateCommentsPutLikeStatusSchema),
  errorHandlingMiddleware,
  commentController.createLikeForComment.bind(commentController)
);
