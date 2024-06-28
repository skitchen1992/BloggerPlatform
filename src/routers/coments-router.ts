import { Router } from 'express';
import { PATH_URL } from '../utils/consts';
import * as controllers from '../controllers';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { checkExactMiddleware } from '../middlewares/check-exact-middleware';
import { UpdateCommentSchema } from '../Veiw/comments/UpdateCommentSchema';
import { bearerTokenAuthMiddleware } from '../middlewares/bearer-token-auth-middleware';
import { validateCommentsPutSchema } from '../middlewares/comments';

export const commentsRouter = Router();

commentsRouter.get(
  PATH_URL.COMMENT_ID,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  controllers.getCommentByIdController
);

commentsRouter.put(
  PATH_URL.COMMENT_ID,
  bearerTokenAuthMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateCommentsPutSchema),
  errorHandlingMiddleware<UpdateCommentSchema>,
  controllers.updateCommentController
);

commentsRouter.delete(
  PATH_URL.COMMENT_ID,
  bearerTokenAuthMiddleware,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  controllers.deleteCommentController
);
