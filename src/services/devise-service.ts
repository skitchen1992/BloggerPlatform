import { ResultStatus } from '../types/common/result';
import { JwtPayload } from 'jsonwebtoken';
import { Session } from '../dto/new-session-dto';
import { JwtService } from './jwt-service';
import { SessionRepository } from '../repositories/session-repository';

export class DeviceService {
  constructor(
    protected jwtService: JwtService,
    protected sessionRepository: SessionRepository,
  ) {
  }

  async deleteDeviceList(refreshToken: string) {
    try {
      const { deviceId } = (this.jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

      if (!deviceId) {
        return { status: ResultStatus.Unauthorized, data: null };
      }

      const { data: deviceAuthSession } = await this.sessionRepository.getDeviceByFields(['deviceId'], deviceId);

      if (deviceAuthSession) {
        await this.sessionRepository.deleteSessionList();

        const session = new Session(
          deviceAuthSession.userId,
          deviceAuthSession.ip,
          deviceAuthSession.title,
          deviceAuthSession.lastActiveDate,
          deviceAuthSession.tokenIssueDate,
          deviceAuthSession.tokenExpirationDate,
          deviceAuthSession.deviceId,
        );

        await this.sessionRepository.createSession(session);

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
    const { deviceId, userId } = (this.jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

    if (!deviceId || !userId) {
      return { status: ResultStatus.Unauthorized, data: null };
    }

    const { data: deviceAuthSession } = await this.sessionRepository.getDeviceByFields(['deviceId'], deviceIdForDelete);

    if (!deviceAuthSession) {
      return { status: ResultStatus.NotFound, data: null };
    }

    if (deviceAuthSession.userId !== userId) {
      return { status: ResultStatus.Forbidden, data: null };
    }

    const { status } = await this.sessionRepository.deleteSessionByDeviceId(deviceIdForDelete);

    return { data: null, status };
  };
}
