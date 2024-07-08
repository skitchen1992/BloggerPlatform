import { Response } from 'express';
import { RequestEmpty, RequestWithBody } from '../types/request-types';
import { COOKIE_KEY, HTTP_STATUSES } from '../utils/consts';
import { ResultStatus } from '../types/common/result';
import {
  AuthUserInfoSchemaResponseView,
  AuthUserRequestView,
  AuthUserSchemaResponseView,
  ResponseErrorResponseView,
} from '../view-model';
import { getUniqueId, hashBuilder } from '../utils/helpers';
import { UserRepository } from '../repositories/user-repository';
import { AuthService } from '../services/auth-service';
import { JwtPayload } from 'jsonwebtoken';
import { AuthRegistrationRequestView } from '../view-model/auth/AuthRegistrationRequestView';
import { AuthRegistrationConfirmationRequestView } from '../view-model/auth/AuthRegistrationConfirmationRequestView';
import { getCurrentDate, isExpiredDate } from '../utils/dates/dates';
import { AuthRegistrationResendingRequestView } from '../view-model/auth/AuthRegistrationResendingRequestView';
import { ObjectId } from 'mongodb';
import { RecoveryPassRequestView } from '../view-model/auth/RecoveryPassRequestView';
import { NewPassRequestView } from '../view-model/auth/NewPassRequestView';
import { EmailService } from '../services/email-service';
import { UserService } from '../services/user-service';
import { JwtService } from '../services/jwt-service';

export class AuthController {
  constructor(protected authService: AuthService,
              protected userRepository: UserRepository,
              protected userService: UserService,
              protected emailService: EmailService,
              protected jwtService: JwtService,
  ) {
  }

  async login(req: RequestWithBody<AuthUserRequestView>, res: Response<ResponseErrorResponseView | AuthUserSchemaResponseView>,
  ) {
    try {

      const {
        data: user,
        status,
      } = await this.userRepository.getUserByFields(['login', 'email'], req.body.loginOrEmail);

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
      //   const { deviceId } = (this.jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};
      //
      //   if (deviceId) {
      //     res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
      //
      //     return;
      //   }
      // }

      const userAgentHeader = req.headers['user-agent'];

      const { data, status: tokenStatus } = await this.authService.addTokenToUser({
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

  async passwordRecovery(req: RequestWithBody<RecoveryPassRequestView>, res: Response<ResponseErrorResponseView | null>,
  ) {
    try {
      const { status } = await this.authService.recoveryPass(req.body.email);

      if (status === ResultStatus.Success) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
      }

      if (status === ResultStatus.BadRequest) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };

  async newPassword(req: RequestWithBody<NewPassRequestView>, res: Response<ResponseErrorResponseView | null>,
  ) {
    try {
      const { status, data } = await this.authService.newPass(req.body.newPassword, req.body.recoveryCode);

      if (status === ResultStatus.Success) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
      }
      if (status === ResultStatus.BadRequest) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json(data);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };


  async refreshToken(req: RequestEmpty, res: Response<ResponseErrorResponseView | AuthUserSchemaResponseView>,
  ) {
    try {
      const refreshToken = req.getCookie(COOKIE_KEY.REFRESH_TOKEN);

      if (!refreshToken) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return;
      }

      const { userId, deviceId, exp } = (this.jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

      if (!userId || !deviceId || !exp) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return;
      }

      const { data, status } = await this.authService.refreshToken(userId, deviceId, exp);

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

  async logoutToken(req: RequestEmpty, res: Response<ResponseErrorResponseView | AuthUserSchemaResponseView>,
  ) {
    try {
      const refreshToken = req.getCookie(COOKIE_KEY.REFRESH_TOKEN);

      if (!refreshToken) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return;
      }

      const { userId } = (this.jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

      if (!userId) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return;
      }

      const { status } = await this.authService.logout(refreshToken);

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

  async authRegistration(req: RequestWithBody<AuthRegistrationRequestView>, res: Response<ResponseErrorResponseView>) {
    try {
      const { status, data } = await this.userRepository.isExistsUser(req.body.login, req.body.email);

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

      const { data: userId, status: userStatus } = await this.userService.createUser(req.body);

      if (userStatus === ResultStatus.Success && userId) {
        const { data, status } = await this.userRepository.getUserByFields(['_id'], new ObjectId(userId));

        if (status === ResultStatus.Success) {
          try {
            await this.emailService.sendRegisterEmail(req.body.email, data!.emailConfirmation.confirmationCode);

            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);

            return;
          } catch (e) {
            await this.userService.deleteUserById(userId!);
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

  async authRegistrationConfirmation(req: RequestWithBody<AuthRegistrationConfirmationRequestView>, res: Response<ResponseErrorResponseView>,
  ) {
    try {
      const { status, data } = await this.userRepository.getUserByConfirmationCode(req.body.code);

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

      const { status: updateStatus } = await this.userService.updateUserFieldById(
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

  async authRegistrationResending(req: RequestWithBody<AuthRegistrationResendingRequestView>, res: Response<ResponseErrorResponseView>,
  ) {
    try {
      const { status, data } = await this.userRepository.getUserByFields(['email'], req.body.email);

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
        await this.userService.updateUserFieldById(data!._id.toString(), 'emailConfirmation.confirmationCode', getUniqueId());

        const { data: updatedUser } = await this.userRepository.getUserByFields(['email'], req.body.email);

        await this.emailService.sendRegisterEmail(req.body.email, updatedUser!.emailConfirmation.confirmationCode);

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        return;
      } catch (e) {
        await this.userService.deleteUserById(data!._id.toString());
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

// export const authController = new AuthController();
