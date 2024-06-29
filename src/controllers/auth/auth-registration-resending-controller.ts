import { Response } from 'express';
import { ResponseErrorSchema } from '../../view';
import { RequestWithBody } from '../../types/request-types';
import { HTTP_STATUSES } from '../../utils/consts';
import { queryRepository } from '../../repositories/queryRepository';
import { ResultStatus } from '../../types/common/result';
import { getCurrentDate, isExpiredDate } from '../../utils/dates/dates';
import { AuthRegistrationResendingSchema } from '../../view/auth/AuthRegistrationResendingSchema';
import { emailService } from '../../services/email-service';
import { updateUserConfirmationService } from '../../services/update-user-confermation-service';
import { getUniqueId } from '../../utils/helpers';
import { userService } from '../../services/user-service';

export const authRegistrationResendingController = async (
  req: RequestWithBody<AuthRegistrationResendingSchema>,
  res: Response<ResponseErrorSchema>
) => {
  try {
    const { status, data } = await queryRepository.getUserByEmail(req.body.email);

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

    if (status === ResultStatus.Success && data!.isConfirmed) {
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

    try {
      await updateUserConfirmationService(data!.id, 'emailConfirmation.confirmationCode', getUniqueId());

      const { data: updatedUser } = await queryRepository.getUserByEmail(req.body.email);

      await emailService.sendRegisterEmail(req.body.email, updatedUser!.confirmationCode);

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
      return;
    } catch (e) {
      await userService.deleteUserById(data!.id);
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
