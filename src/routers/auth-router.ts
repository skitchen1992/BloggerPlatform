import { Router } from 'express';
import { PATH_URL } from '../utils/consts';
import * as controllers from '../controllers';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { checkExactMiddleware } from '../middlewares/check-exact-middleware';
import { validateAuthPostSchema } from '../middlewares/auth';
import { bearerTokenAuthMiddleware } from '../middlewares/bearer-token-auth-middleware';
import { AuthUserSchema } from '../view';
import { validateAuthRegistrationSchema } from '../middlewares/auth/validate-schemas/validate-auth-registration-schema';
import { validateAuthRegistrationConfirmationSchema } from '../middlewares/auth/validate-schemas/validate-auth-registration-confirmation-schema';
import { validateAuthRegistrationResendingSchema } from '../middlewares/auth/validate-schemas/validate-auth-registration-resending-schema';
import { guardVisitMiddleware } from '../middlewares/guard-visit-middleware';
import { authController } from '../controllers/auth-controller';

export const authRouter = Router();

authRouter.post(
  PATH_URL.AUTH.LOGIN,
  guardVisitMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateAuthPostSchema),
  errorHandlingMiddleware<AuthUserSchema>,
  authController.auth,
  //controllers.authController
);

authRouter.post(
  PATH_URL.AUTH.REFRESH_TOKEN,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  authController.refreshToken,
  //controllers.refreshTokenController
);

authRouter.post(
  PATH_URL.AUTH.LOGOUT,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  authController.logoutTokenController,
  //controllers.logoutTokenController
);

authRouter.get(
  PATH_URL.AUTH.ME,
  bearerTokenAuthMiddleware,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  authController.me
  // controllers.meController
);

authRouter.post(
  PATH_URL.AUTH.REGISTRATION,
  guardVisitMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateAuthRegistrationSchema),
  errorHandlingMiddleware,
  authController.authRegistration,
  //controllers.authRegistrationController
);

authRouter.post(
  PATH_URL.AUTH.REGISTRATION_CONFIRMATION,
  guardVisitMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateAuthRegistrationConfirmationSchema),
  errorHandlingMiddleware,
  authController.authRegistrationConfirmation,
  //controllers.authRegistrationConfirmationController
);

authRouter.post(
  PATH_URL.AUTH.REGISTRATION_EMAIL_RESENDING,
  guardVisitMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateAuthRegistrationResendingSchema),
  errorHandlingMiddleware,
  authController.authRegistrationResending,
  //controllers.authRegistrationResendingController
);
