import { RequestEmpty, RequestWithParams } from '../types/request-types';
import { Response } from 'express';
import { GetDeviceSchema } from '../view';
import { COOKIE_KEY, HTTP_STATUSES } from '../utils/consts';
import { jwtService } from '../services/jwt-service';
import { JwtPayload } from 'jsonwebtoken';
import { ResultStatus } from '../types/common/result';
import { sessionRepository } from '../repositories/session-repository';
import { deviseService } from '../services/devise-service';

class DeviceController {
  async getDevices(req: RequestEmpty, res: Response<GetDeviceSchema[]>) {
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

      const { data, status } = await sessionRepository.getDeviceListByUserId(userId);

      if (status === ResultStatus.Success) {
        res.status(HTTP_STATUSES.OK_200).json(data);
      } else {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  };

  async deleteDeviceList(req: RequestEmpty, res: Response<GetDeviceSchema[]>) {
    try {
      const refreshToken = req.getCookie(COOKIE_KEY.REFRESH_TOKEN);

      if (!refreshToken) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return;
      }

      const { status } = await deviseService.deleteDeviceList(refreshToken);

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

  async deleteDevice(req: RequestWithParams<{ deviceId: string }>, res: Response) {
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

      const { status } = await deviseService.deleteDevice(refreshToken, req.params.deviceId);

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
}

export const deviceController = new DeviceController();
