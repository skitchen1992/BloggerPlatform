import { Response } from 'express';
import { RequestEmpty, RequestWithBody } from '../types/request-types';
import { COOKIE_KEY, HTTP_STATUSES } from '../utils/consts';
import { ResultStatus } from '../types/common/result';
import {
  AuthUserInfoSchemaResponseView,
  AuthUserRequestView,
  AuthUserSchemaResponseView,
  ResponseErrorSchema,
} from '../view';
import { getUniqueId, hashBuilder } from '../utils/helpers';
import { userRepository } from '../repositories/user-repository';
import { authService } from '../services/auth-service';
import { jwtService } from '../services/jwt-service';
import { JwtPayload } from 'jsonwebtoken';
import { AuthRegistrationRequestView } from '../view/auth/AuthRegistrationRequestView';
import { emailService } from '../services/email-service';
import { userService } from '../services/user-service';
import { AuthRegistrationConfirmationRequestView } from '../view/auth/AuthRegistrationConfirmationRequestView';
import { getCurrentDate, isExpiredDate } from '../utils/dates/dates';
import { AuthRegistrationResendingRequestView } from '../view/auth/AuthRegistrationResendingRequestView';
import { ObjectId } from 'mongodb';

class AuthController {
  async login(req: RequestWithBody<AuthUserRequestView>, res: Response<ResponseErrorSchema | AuthUserSchemaResponseView>,
  ) {
    try {

      const { data: user, status } = await userRepository.getUserByFields(['login', 'email'], req.body.loginOrEmail);

      if (status !== ResultStatus.Success) {
        res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
          errorsMessages: [
            {
              message: 'Login or Email is wrong',
              field: 'User',
            },
          ],
        });
        return;
      }

      const isCorrectPass = await hashBuilder.compare(req.body.password, user!.password);

      if (!isCorrectPass) {
        res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
          errorsMessages: [
            {
              message: 'Password or login is wrong',
              field: 'User',
            },
          ],
        });

        return;
      }
      //TODO: for test

      // const refreshToken = req.getCookie(COOKIE_KEY.REFRESH_TOKEN);
      //
      // if (refreshToken) {
      //   const { deviceId } = (jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};
      //
      //   if (deviceId) {
      //     res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
      //
      //     return;
      //   }
      // }

      const userAgentHeader = req.headers['user-agent'];

      const { data, status: tokenStatus } = await authService.addTokenToUser({
        userId: user!._id.toString(),
        ip: req.ip!,
        title: userAgentHeader || 'user agent',
      });

      if (tokenStatus !== ResultStatus.Success && !data) {
        res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
          errorsMessages: [
            {
              message: 'Password or login is wrong',
              field: 'User',
            },
          ],
        });

        return;
      }

      if (tokenStatus === ResultStatus.Success && data) {
        req.setCookie(COOKIE_KEY.REFRESH_TOKEN, data.refreshToken);

        res.status(HTTP_STATUSES.OK_200).json({ accessToken: data.accessToken });
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };


  async refreshToken(req: RequestEmpty, res: Response<ResponseErrorSchema | AuthUserSchemaResponseView>,
  ) {
    try {
      const refreshToken = req.getCookie(COOKIE_KEY.REFRESH_TOKEN);

      if (!refreshToken) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return;
      }

      const { userId, deviceId, exp } = (jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

      if (!userId || !deviceId || !exp) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return;
      }

      const { data, status } = await authService.refreshToken(userId, deviceId, exp);

      if (status === ResultStatus.Success && data) {
        req.setCookie(COOKIE_KEY.REFRESH_TOKEN, data.refreshToken);

        res.status(HTTP_STATUSES.OK_200).json({ accessToken: data.accessToken });
      } else {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };

  async logoutToken(req: RequestEmpty, res: Response<ResponseErrorSchema | AuthUserSchemaResponseView>,
  ) {
    try {
      const refreshToken = req.getCookie(COOKIE_KEY.REFRESH_TOKEN);

      if (!refreshToken) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return;
      }

      const { userId } = (jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

      if (!userId) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return;
      }

      const { status } = await authService.logout(refreshToken);

      if (status === ResultStatus.Success) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
      } else {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
      }
    } catch (e) {
      console.log(e);
    }
  };

  async me(req: RequestEmpty, res: Response<AuthUserInfoSchemaResponseView>) {
    try {
      const user: AuthUserInfoSchemaResponseView = {
        email: res.locals.user!.email,
        login: res.locals.user!.login,
        userId: res.locals.user!.id,
      };

      res.status(HTTP_STATUSES.OK_200).json(user);
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };

  async authRegistration(req: RequestWithBody<AuthRegistrationRequestView>, res: Response<ResponseErrorSchema>) {
    try {
      const { status, data } = await userRepository.isExistsUser(req.body.login, req.body.email);

      if (status === ResultStatus.BadRequest) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
          errorsMessages: [
            {
              message: 'Email or login already exist',
              field: data!,
            },
          ],
        });
        return;
      }

      const { data: userId, status: userStatus } = await userService.createUser(req.body);

      if (userStatus === ResultStatus.Success && userId) {
        const { data, status } = await userRepository.getUserByFields(['_id'], new ObjectId(userId));

        if (status === ResultStatus.Success) {
          try {
            await emailService.sendRegisterEmail(req.body.email, data!.emailConfirmation.confirmationCode);

            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);

            return;
          } catch (e) {
            await userService.deleteUserById(userId!);
          }
        }

        if (status === ResultStatus.NotFound) {
          res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            errorsMessages: [
              {
                message: 'Email and login should be unique',
                field: 'email',
              },
            ],
          });
          return;
        }
      }
    } catch (e) {
      res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
        errorsMessages: [
          {
            message: 'Email and login should be unique',
            field: 'email',
          },
        ],
      });
    }
  };

  async authRegistrationConfirmation(req: RequestWithBody<AuthRegistrationConfirmationRequestView>, res: Response<ResponseErrorSchema>,
  ) {
    try {
      const { status, data } = await userRepository.getUserByConfirmationCode(req.body.code);

      if (status === ResultStatus.BadRequest) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
          errorsMessages: [
            {
              message: 'Activation code is not correct',
              field: 'code',
            },
          ],
        });
        return;
      }

      if (status === ResultStatus.Success && data!.isConfirmed) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
          errorsMessages: [
            {
              message: 'Email already confirmed',
              field: 'code',
            },
          ],
        });
        return;
      }

      if (status === ResultStatus.Success && isExpiredDate(data!.expirationDate, getCurrentDate())) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
          errorsMessages: [
            {
              message: 'Confirmation code expired',
              field: 'code',
            },
          ],
        });
        return;
      }

      const { status: updateStatus } = await userService.updateUserFieldById(
        data!.id,
        'emailConfirmation.isConfirmed',
        true,
      );

      if (updateStatus === ResultStatus.Success) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
      } else {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
          errorsMessages: [
            {
              message: 'Email is not confirmed',
              field: 'email',
            },
          ],
        });
      }
    } catch (e) {
      res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
        errorsMessages: [
          {
            message: 'Email and login should be unique',
            field: 'code',
          },
        ],
      });
    }
  };

  async authRegistrationResending(req: RequestWithBody<AuthRegistrationResendingRequestView>, res: Response<ResponseErrorSchema>,
  ) {
    try {
      const { status, data } = await userRepository.getUserByFields(['email'], req.body.email);

      if (status === ResultStatus.BadRequest) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
          errorsMessages: [
            {
              message: 'Email not found',
              field: 'email',
            },
          ],
        });
        return;
      }

      if (status === ResultStatus.Success && data!.emailConfirmation.isConfirmed) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
          errorsMessages: [
            {
              message: 'Email already confirmed',
              field: 'email',
            },
          ],
        });
        return;
      }

      if (status === ResultStatus.Success && isExpiredDate(data!.emailConfirmation.expirationDate, getCurrentDate())) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
          errorsMessages: [
            {
              message: 'Confirmation code expired',
              field: 'code',
            },
          ],
        });
        return;
      }

      try {
        await userService.updateUserFieldById(data!._id.toString(), 'emailConfirmation.confirmationCode', getUniqueId());


        const { data: updatedUser } = await userRepository.getUserByFields(['email'], req.body.email);

        await emailService.sendRegisterEmail(req.body.email, updatedUser!.emailConfirmation.confirmationCode);

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        return;
      } catch (e) {
        await userService.deleteUserById(data!._id.toString());
      }
    } catch (e) {
      res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
        errorsMessages: [
          {
            message: 'Email and login should be unique',
            field: 'email',
          },
        ],
      });
    }
  };
}

export const authController = new AuthController();
