import { mongoDBRepository } from '../repositories/db-repository';
import { deviceAuthSessionsCollection } from '../db/collection';
import { ResultStatus } from '../types/common/result';
import { jwtService } from './jwt-service';
import { DeviceAuthSessionDbType } from '../types/device-auth-session-types';
import { ACCESS_TOKEN_EXPIRED_IN, REFRESH_TOKEN_EXPIRED_IN } from '../utils/consts';
import { fromUnixTimeToISO, getCurrentDate, isExpiredDate } from '../utils/dates/dates';
import { queryRepository } from '../repositories/queryRepository';

export const refreshTokenService = async (userId: string, deviceId: string, exp: number) => {
  const data = await mongoDBRepository.getByField<DeviceAuthSessionDbType>(
    deviceAuthSessionsCollection,
    ['deviceId'],
    deviceId
  );

  if (!data?.tokenExpirationDate) {
    return { status: ResultStatus.NotFound, data: null };
  }

  if (data.tokenExpirationDate !== fromUnixTimeToISO(exp)) {
    return { status: ResultStatus.Unauthorized, data: null };
  }

  const newAccessToken = jwtService.generateToken({ userId }, { expiresIn: ACCESS_TOKEN_EXPIRED_IN });
  const newRefreshToken = jwtService.generateToken({ userId, deviceId }, { expiresIn: REFRESH_TOKEN_EXPIRED_IN });

  const { data: deviceAuthSession } = await queryRepository.getDeviceAuthSession(deviceId);

  if (!deviceAuthSession) {
    return { status: ResultStatus.NotFound, data: null };
  }

  if (isExpiredDate(deviceAuthSession.tokenExpirationDate, getCurrentDate())) {
    return { status: ResultStatus.Unauthorized, data: null };
  }

  const updateResult = await mongoDBRepository.update<DeviceAuthSessionDbType>(
    deviceAuthSessionsCollection,
    deviceAuthSession._id.toString(),
    {
      tokenExpirationDate: jwtService.getTokenExpirationDate(newRefreshToken),
      lastActiveDate: getCurrentDate(),
    }
  );

  if (updateResult.modifiedCount !== 1) {
    return { status: ResultStatus.NotFound, data: null };
  }

  const token = await mongoDBRepository.getById<DeviceAuthSessionDbType>(
    deviceAuthSessionsCollection,
    deviceAuthSession._id.toString()
  );

  if (!token) {
    return { status: ResultStatus.NotFound, data: null };
  }

  return { status: ResultStatus.Success, data: { refreshToken: newRefreshToken, accessToken: newAccessToken } };
};
