import { ResultStatus } from '../types/common/result';
import { jwtService } from './jwt-service';
import { JwtPayload } from 'jsonwebtoken';
import { sessionRepository } from '../repositories/session-repository';
import { SessionModel } from '../models/session';

class DeviceService {
  async deleteDeviceList(refreshToken: string) {
    const { deviceId } = (jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

    if (!deviceId) {
      return { status: ResultStatus.Unauthorized, data: null };
    }

    const { data: deviceAuthSession } = await sessionRepository.getDeviceByFields(['deviceId'], deviceId);

    if (!deviceAuthSession) {
      return { status: ResultStatus.NotFound, data: null };
    }

    if (deviceAuthSession) {
      await SessionModel.deleteMany();

      const newSession = new SessionModel(deviceAuthSession);
      const savedSession = await newSession.save();


      if (savedSession) {
        return { status: ResultStatus.Success, data: null };
      } else {
        return { status: ResultStatus.NotFound, data: null };
      }
    }
    return { status: ResultStatus.NotFound, data: null };
  };

  async deleteDevice(refreshToken: string, deviceIdForDelete: string) {
    const { deviceId, userId } = (jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

    if (!deviceId || !userId) {
      return { status: ResultStatus.Unauthorized, data: null };
    }
    const deleteResult = await SessionModel.deleteOne({ deviceId: deviceIdForDelete });

    if (deleteResult.deletedCount === 1) {
      return { data: null, status: ResultStatus.Success };
    } else {
      return { data: null, status: ResultStatus.NotFound };
    }
  };
}

export const deviseService = new DeviceService();

