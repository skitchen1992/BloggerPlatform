import { Response } from 'express';
import { COOKIE_KEY, HTTP_STATUSES } from '../../utils/consts';
import { GetDeviceSchema } from '../../Veiw';
import { RequestEmpty } from '../../types/request-types';
import { jwtService } from '../../services/jwt-service';
import { JwtPayload } from 'jsonwebtoken';
import { ResultStatus } from '../../types/common/result';
import { queryRepository } from '../../repositories/queryRepository';

export const getDevicesController = async (req: RequestEmpty, res: Response<GetDeviceSchema[]>) => {
  try {
    const refreshToken = req.getCookie(COOKIE_KEY.REFRESH_TOKEN);

    if (!refreshToken) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
      return;
    }

    const { userId, deviceId } = (jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

    if (!userId || !deviceId) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
      return;
    }

    const { data, status } = await queryRepository.getDeviceList(userId);

    if (status === ResultStatus.Success) {
      res.status(HTTP_STATUSES.OK_200).json(data.entities);
    } else {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
