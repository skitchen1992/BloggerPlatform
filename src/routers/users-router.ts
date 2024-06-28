import { Router } from 'express';
import { getUsersQueryParams, PATH_URL } from '../utils/consts';
import * as controllers from '../controllers';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { CreateUserSchema } from '../models';
import { checkExactMiddleware } from '../middlewares/check-exact-middleware';
import { validateUserPostSchema } from '../middlewares/users';
import { basicAuthMiddleware } from '../middlewares/basic-auth-middleware';

export const usersRouter = Router();

usersRouter.get(
  PATH_URL.ROOT,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(getUsersQueryParams),
  errorHandlingMiddleware<CreateUserSchema>,
  controllers.getUsersController
);

usersRouter.post(
  PATH_URL.ROOT,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateUserPostSchema),
  errorHandlingMiddleware<CreateUserSchema>,
  controllers.createUserController
);

usersRouter.delete(
  PATH_URL.ID,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  controllers.deleteUserController
);
