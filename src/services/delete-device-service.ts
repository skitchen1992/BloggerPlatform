import { ResultStatus } from '../types/common/result';
import { jwtService } from './jwt-service';
import { JwtPayload } from 'jsonwebtoken';
import { mongoDBRepository } from '../repositories/db-repository';
import { DeviceAuthSessionDbType } from '../types/device-auth-session-types';
import { deviceAuthSessionsCollection } from '../db/collection';
import { queryRepository } from '../repositories/queryRepository';

export const deleteDeviceService = async (refreshToken: string, deviceIdForDelete: string) => {
  const { deviceId, userId } = (jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

  if (!deviceId || !userId) {
    return { status: ResultStatus.Unauthorized, data: null };
  }

  const { data: deviceAuthSession } = await queryRepository.getDeviceAuthSession(deviceIdForDelete);

  if (!deviceAuthSession) {
    return { status: ResultStatus.NotFound, data: null };
  }

  if (deviceAuthSession.userId !== userId) {
    return { status: ResultStatus.Forbidden, data: null };
  }

  const deleteResult = await mongoDBRepository.delete<DeviceAuthSessionDbType>(
    deviceAuthSessionsCollection,
    deviceAuthSession._id.toString()
  );

  if (deleteResult.deletedCount === 1) {
    return { data: null, status: ResultStatus.Success };
  } else {
    return { data: null, status: ResultStatus.NotFound };
  }
};
