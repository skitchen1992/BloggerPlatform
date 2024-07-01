import { getUniqueId } from '../utils/helpers';
import { ResultStatus } from '../types/common/result';
import { fromUnixTimeToISO, getCurrentDate, getDateFromObjectId } from '../utils/dates/dates';
import { ObjectId } from 'mongodb';
import { jwtService } from './jwt-service';
import { ACCESS_TOKEN_EXPIRED_IN, REFRESH_TOKEN_EXPIRED_IN } from '../utils/consts';
import { DeviceSessionModel } from '../models/device-session';
import { deviceSessionRepository } from '../repositories/device-session-repository';
import { JwtPayload } from 'jsonwebtoken';


type Payload = {
  userId: string;
  ip: string;
  title: string;
};

class AuthService {
  async addTokenToUser(payload: Payload) {
    try {
      const { userId, ip, title } = payload;

      const objectId = new ObjectId();
      const deviceId = getUniqueId();

      const accessToken = jwtService.generateToken({ userId }, { expiresIn: ACCESS_TOKEN_EXPIRED_IN });

      const refreshToken = jwtService.generateToken({ userId, deviceId }, { expiresIn: REFRESH_TOKEN_EXPIRED_IN });

      const data = new DeviceSessionModel({
        _id: objectId,
        userId,
        ip,
        title,
        lastActiveDate: getDateFromObjectId(objectId),
        tokenIssueDate: getDateFromObjectId(objectId),
        tokenExpirationDate: jwtService.getTokenExpirationDate(refreshToken),
        deviceId,
      });


      await data.save();

      return { status: ResultStatus.Success, data: { refreshToken, accessToken } };
    } catch (error) {
      console.log(`Token not added: ${error}`);
      return { status: ResultStatus.NotFound, data: null };
    }
  };

  async refreshToken(userId: string, deviceId: string, exp: number) {
    try {
      const { data: device } = await deviceSessionRepository.getDeviceByFields(
        ['deviceId'],
        deviceId,
      );

      if (!device?.tokenExpirationDate) {
        return { status: ResultStatus.Unauthorized, data: null };
      }

      if (device.tokenExpirationDate !== fromUnixTimeToISO(exp)) {
        return { status: ResultStatus.Unauthorized, data: null };
      }

      const newAccessToken = jwtService.generateToken({ userId }, { expiresIn: ACCESS_TOKEN_EXPIRED_IN });
      const newRefreshToken = jwtService.generateToken({ userId, deviceId }, { expiresIn: REFRESH_TOKEN_EXPIRED_IN });

      // const { data: deviceAuthSession } = await queryRepository.getDeviceAuthSession(deviceId);
      //
      // if (!deviceAuthSession) {
      //   return { status: ResultStatus.NotFound, data: null };
      // }
      //
      // if (isExpiredDate(deviceAuthSession.tokenExpirationDate, getCurrentDate())) {
      //   return { status: ResultStatus.Unauthorized, data: null };
      // }

      await DeviceSessionModel.updateOne({ _id: device._id }, {
        tokenExpirationDate: jwtService.getTokenExpirationDate(newRefreshToken),
        lastActiveDate: getCurrentDate(),
      });


      return { status: ResultStatus.Success, data: { refreshToken: newRefreshToken, accessToken: newAccessToken } };

    } catch (error) {
      console.log(`Token not added: ${error}`);
      return { status: ResultStatus.Unauthorized, data: null };
    }

  }

  async logout(refreshToken: string) {
    const { userId, deviceId, exp } = (jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

    if (!userId || !deviceId || !exp) {
      return { status: ResultStatus.Unauthorized, data: null };
    }

    const { data: device } = await deviceSessionRepository.getDeviceByFields(
      ['deviceId'],
      deviceId,
    );

    if (!device?.tokenExpirationDate) {
      return { status: ResultStatus.Unauthorized, data: null };
    }

    if (device.tokenExpirationDate !== fromUnixTimeToISO(exp)) {
      return { status: ResultStatus.Unauthorized, data: null };
    }

    // if (isExpiredDate(device.tokenExpirationDate, getCurrentDate())) {
    //   return { status: ResultStatus.Unauthorized, data: null };
    // }

    await DeviceSessionModel.findByIdAndDelete(device._id);

    return { data: null, status: ResultStatus.Success };
  };

}

export const authService = new AuthService();

