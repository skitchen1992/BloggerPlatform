import { Response } from 'express';
import { ResponseErrorSchema } from '../../view';
import { RequestWithBody } from '../../types/request-types';
import { HTTP_STATUSES } from '../../utils/consts';
import { queryRepository } from '../../repositories/queryRepository';
import { ResultStatus } from '../../types/common/result';
import { AuthRegistrationConfirmationSchema } from '../../view/auth/AuthRegistrationConfirmationSchema';
import { getCurrentDate, isExpiredDate } from '../../utils/dates/dates';
import { updateUserConfirmationService } from '../../services/update-user-confermation-service';

export const authRegistrationConfirmationController = async (
  req: RequestWithBody<AuthRegistrationConfirmationSchema>,
  res: Response<ResponseErrorSchema>
) => {
  try {
    const { status, data } = await queryRepository.getUserByConfirmationCode(req.body.code);

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

    const { status: updateStatus } = await updateUserConfirmationService(
      data!.id,
      'emailConfirmation.isConfirmed',
      true
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
