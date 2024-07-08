import { ResultStatus } from '../types/common/result';
import { jwtService } from './jwt-service';
import { JwtPayload } from 'jsonwebtoken';
import { sessionRepository } from '../repositories/session-repository';
import { Session } from '../dto/new-session-dto';

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

        const session = new Session(
          deviceAuthSession._id,
          deviceAuthSession.userId,
          deviceAuthSession.ip,
          deviceAuthSession.title,
          deviceAuthSession.lastActiveDate,
          deviceAuthSession.tokenIssueDate,
          deviceAuthSession.tokenExpirationDate,
          deviceAuthSession.deviceId,
        );

        await sessionRepository.createSession(session);

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
