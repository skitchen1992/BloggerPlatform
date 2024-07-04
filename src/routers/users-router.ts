import { Router } from 'express';
import { getUsersQueryParams, PATH_URL } from '../utils/consts';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { CreateUserRequestView } from '../view';
import { checkExactMiddleware } from '../middlewares/check-exact-middleware';
import { validateUserPostSchema } from '../middlewares/users';
import { basicAuthMiddleware } from '../middlewares/basic-auth-middleware';
import { userController } from '../controllers/user-controller';

export const usersRouter = Router();

usersRouter.get(
  PATH_URL.ROOT,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(getUsersQueryParams),
  errorHandlingMiddleware<CreateUserRequestView>,
  userController.getUsers
);

usersRouter.post(
  PATH_URL.ROOT,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateUserPostSchema),
  errorHandlingMiddleware<CreateUserRequestView>,
  userController.createUser
);

usersRouter.delete(
  PATH_URL.ID,
  basicAuthMiddleware,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  userController.deleteUser
);
