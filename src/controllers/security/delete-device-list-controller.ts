import { Response } from 'express';
import { COOKIE_KEY, HTTP_STATUSES } from '../../utils/consts';
import { GetDeviceSchema } from '../../models';
import { RequestEmpty } from '../../types/request-types';
import { ResultStatus } from '../../types/common/result';
import { deleteDeviceListService } from '../../services/delete-device-list-service';

export const deleteDeviceListController = async (req: RequestEmpty, res: Response<GetDeviceSchema[]>) => {
  try {
    const refreshToken = req.getCookie(COOKIE_KEY.REFRESH_TOKEN);

    if (!refreshToken) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
      return;
    }

    const { status } = await deleteDeviceListService(refreshToken);

    if (status === ResultStatus.Success) {
      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } else {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
