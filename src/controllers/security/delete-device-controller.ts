import { Response } from 'express';
import { COOKIE_KEY, HTTP_STATUSES } from '../../utils/consts';
import { RequestWithParams } from '../../types/request-types';
import { ResultStatus } from '../../types/common/result';
import { deleteDeviceService } from '../../services/delete-device-service';

export const deleteDeviceController = async (req: RequestWithParams<{ deviceId: string }>, res: Response) => {
  try {
    if (!req.params.deviceId) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    const refreshToken = req.getCookie(COOKIE_KEY.REFRESH_TOKEN);

    if (!refreshToken) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
      return;
    }

    const { status } = await deleteDeviceService(refreshToken, req.params.deviceId);

    if (status === ResultStatus.Success) {
      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
      return;
    }

    if (status === ResultStatus.Unauthorized) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
      return;
    }

    if (status === ResultStatus.Forbidden) {
      res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
      return;
    }

    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
