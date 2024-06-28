import { ResultStatus } from '../types/common/result';
import { jwtService } from './jwt-service';
import { JwtPayload } from 'jsonwebtoken';
import { mongoDBRepository } from '../repositories/db-repository';
import { DeviceAuthSessionDbType } from '../types/device-auth-session-types';
import { deviceAuthSessionsCollection } from '../db/collection';
import { queryRepository } from '../repositories/queryRepository';

export const deleteDeviceListService = async (refreshToken: string) => {
  const { deviceId } = (jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

  if (!deviceId) {
    return { status: ResultStatus.Unauthorized, data: null };
  }

  const { data: deviceAuthSession } = await queryRepository.getDeviceAuthSession(deviceId);

  if (!deviceAuthSession) {
    return { status: ResultStatus.NotFound, data: null };
  }

  if (deviceAuthSession) {
    await deviceAuthSessionsCollection.deleteMany({});

    const insertOneResult = await mongoDBRepository.add<DeviceAuthSessionDbType>(
      deviceAuthSessionsCollection,
      deviceAuthSession
    );

    const session = await mongoDBRepository.getById<DeviceAuthSessionDbType>(
      deviceAuthSessionsCollection,
      insertOneResult.insertedId.toString()
    );

    if (session) {
      return { status: ResultStatus.Success, data: null };
    } else {
      return { status: ResultStatus.NotFound, data: null };
    }
  }
  return { status: ResultStatus.NotFound, data: null };
};
