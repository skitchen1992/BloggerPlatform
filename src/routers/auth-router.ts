import { Router } from 'express';
import { PATH_URL } from '../utils/consts';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { checkExactMiddleware } from '../middlewares/check-exact-middleware';
import { validateAuthPostSchema } from '../middlewares/auth';
import { bearerTokenAuthMiddleware } from '../middlewares/bearer-token-auth-middleware';
import { AuthUserRequestView } from '../view-model';
import { validateAuthRegistrationSchema } from '../middlewares/auth/validate-schemas/validate-auth-registration-schema';
import { validateAuthRegistrationConfirmationSchema } from '../middlewares/auth/validate-schemas/validate-auth-registration-confirmation-schema';
import { validateAuthRegistrationResendingSchema } from '../middlewares/auth/validate-schemas/validate-auth-registration-resending-schema';
import { guardVisitMiddleware } from '../middlewares/guard-visit-middleware';
import {
  validateAuthPostPasswordRecoverySchema
} from '../middlewares/auth/validate-schemas/validate-auth-post-password-recovery-schema';
import {
  validateAuthPostNewPasswordSchema
} from '../middlewares/auth/validate-schemas/validate-auth-post-new-password-schema';
import { authController } from '../compositions/composition-root';

export const authRouter = Router();

authRouter.post(
  PATH_URL.AUTH.LOGIN,
  guardVisitMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateAuthPostSchema),
  errorHandlingMiddleware<AuthUserRequestView>,
  authController.login.bind(authController),
);

authRouter.post(
  PATH_URL.AUTH.PASSWORD_RECOVERY,
  guardVisitMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateAuthPostPasswordRecoverySchema),
  errorHandlingMiddleware,
  authController.passwordRecovery.bind(authController),
);

authRouter.post(
  PATH_URL.AUTH.NEW_PASSWORD,
  guardVisitMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateAuthPostNewPasswordSchema),
  errorHandlingMiddleware,
  authController.newPassword.bind(authController),
);

authRouter.post(
  PATH_URL.AUTH.REFRESH_TOKEN,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  authController.refreshToken.bind(authController),
);

authRouter.post(
  PATH_URL.AUTH.LOGOUT,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  authController.logoutToken.bind(authController),
);

authRouter.get(
  PATH_URL.AUTH.ME,
  bearerTokenAuthMiddleware,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  authController.me.bind(authController)
);

authRouter.post(
  PATH_URL.AUTH.REGISTRATION,
  guardVisitMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateAuthRegistrationSchema),
  errorHandlingMiddleware,
  authController.authRegistration.bind(authController),
);

authRouter.post(
  PATH_URL.AUTH.REGISTRATION_CONFIRMATION,
  guardVisitMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateAuthRegistrationConfirmationSchema),
  errorHandlingMiddleware,
  authController.authRegistrationConfirmation.bind(authController),
);

authRouter.post(
  PATH_URL.AUTH.REGISTRATION_EMAIL_RESENDING,
  guardVisitMiddleware,
  sanitizerQueryMiddleware(),
  checkExactMiddleware(validateAuthRegistrationResendingSchema),
  errorHandlingMiddleware,
  authController.authRegistrationResending.bind(authController),
);
