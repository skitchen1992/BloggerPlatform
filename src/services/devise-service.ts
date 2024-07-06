import { ResultStatus } from '../types/common/result';
import { jwtService } from './jwt-service';
import { JwtPayload } from 'jsonwebtoken';
import { sessionRepository } from '../repositories/session-repository';

class DeviceService {
  async deleteDeviceList(refreshToken: string) {
    try {
      const { deviceId } = (jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

      if (!deviceId) {
        return { status: ResultStatus.Unauthorized, data: null };
      }

      const { data: deviceAuthSession } = await sessionRepository.getDeviceByFields(['deviceId'], deviceId);

      if (deviceAuthSession) {
        await sessionRepository.deleteSessionList();

        const newSession = {
          _id: deviceAuthSession._id,
          userId: deviceAuthSession.userId,
          ip: deviceAuthSession.ip,
          title: deviceAuthSession.title,
          lastActiveDate: deviceAuthSession.lastActiveDate,
          tokenIssueDate: deviceAuthSession.tokenIssueDate,
          tokenExpirationDate: deviceAuthSession.tokenExpirationDate,
          deviceId: deviceAuthSession.deviceId,
        };

        await sessionRepository.createSession(newSession);

        return { status: ResultStatus.Success, data: null };
      } else {
        return { status: ResultStatus.Unauthorized, data: null };
      }
    } catch (e) {
      console.log(e);
      return { status: ResultStatus.Unauthorized, data: null };
    }
  };

  async deleteDevice(refreshToken: string, deviceIdForDelete: string) {
    const { deviceId, userId } = (jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

    if (!deviceId || !userId) {
      return { status: ResultStatus.Unauthorized, data: null };
    }

    const { data: deviceAuthSession } = await sessionRepository.getDeviceByFields(['deviceId'], deviceIdForDelete);

    if (!deviceAuthSession) {
      return { status: ResultStatus.NotFound, data: null };
    }

    if (deviceAuthSession.userId !== userId) {
      return { status: ResultStatus.Forbidden, data: null };
    }

    const { status } = await sessionRepository.deleteSessionByDeviceId(deviceIdForDelete);

    return { data: null, status };
  };
}

export const deviseService = new DeviceService();
