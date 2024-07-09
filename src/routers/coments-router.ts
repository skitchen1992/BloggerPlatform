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

export const commentsRouter = Router();

commentsRouter.get(
  PATH_URL.COMMENT_ID,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  commentController.getCommentById.bind(commentController)
);

commentsRouter.put(
  PATH_URL.COMMENT_ID,
  bearerTokenAuthMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateCommentsPutSchema),
  errorHandlingMiddleware<UpdateCommentRequestView>,
  commentController.updateComment.bind(commentController)
);

commentsRouter.delete(
  PATH_URL.COMMENT_ID,
  bearerTokenAuthMiddleware,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  commentController.deleteComment.bind(commentController)
);

commentsRouter.put(
  PATH_URL.LIKE_STATUS,
  bearerTokenAuthMiddleware,
  checkCommentExistsMiddleware.urlParams('commentId'),
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  commentController.createLikeForComment.bind(commentController)
);
