import { getUniqueId, hashBuilder } from '../utils/helpers';
import { ResultStatus } from '../types/common/result';
import { fromUnixTimeToISO, getCurrentDate, getDateFromObjectId, isExpiredDate } from '../utils/dates/dates';
import { ObjectId } from 'mongodb';
import { jwtService } from './jwt-service';
import {
  ACCESS_TOKEN_EXPIRED_IN,
  RECOVERY_PASS_TOKEN_EXPIRED,
  REFRESH_TOKEN_EXPIRED_IN,
} from '../utils/consts';
import { sessionRepository } from '../repositories/session-repository';
import { JwtPayload } from 'jsonwebtoken';
import { userRepository } from '../repositories/user-repository';
import { emailService } from './email-service';
import { Session } from '../dto/new-session-dto';


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

      const session = new Session(
        objectId,
        userId,
        ip,
        title,
        getDateFromObjectId(objectId),
        getDateFromObjectId(objectId),
        jwtService.getTokenExpirationDate(refreshToken),
        deviceId);

      await sessionRepository.createSession(session);

      return { status: ResultStatus.Success, data: { refreshToken, accessToken } };
    } catch (error) {
      console.log(`Token not added: ${error}`);
      return { status: ResultStatus.NotFound, data: null };
    }
  };

  async refreshToken(userId: string, deviceId: string, exp: number) {
    try {
      const { data: device } = await sessionRepository.getDeviceByFields(
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

      await sessionRepository.updateSessionById(device._id.toString(), {
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

    const { data: device } = await sessionRepository.getDeviceByFields(
      ['deviceId'],
      deviceId,
    );

    if (!device?.tokenExpirationDate) {
      return { status: ResultStatus.Unauthorized, data: null };
    }

    if (device.tokenExpirationDate !== fromUnixTimeToISO(exp)) {
      return { status: ResultStatus.Unauthorized, data: null };
    }

    await sessionRepository.deleteSessionById(device._id.toString());

    return { data: null, status: ResultStatus.Success };
  };

  async recoveryPass(email: string) {
    const { data: user, status } = await userRepository.getUserByFields(['email'], email);

    if (status === ResultStatus.NotFound) {
      const recoveryPassToken = jwtService.generateToken({ userId: null }, { expiresIn: RECOVERY_PASS_TOKEN_EXPIRED });

      await emailService.sendRecoveryPassEmail(email, recoveryPassToken);

      return { status: ResultStatus.Success, data: null };
    }

    const recoveryPassToken = jwtService.generateToken({ userId: user?._id.toString() }, { expiresIn: RECOVERY_PASS_TOKEN_EXPIRED });

    await userRepository.updateUserById(user!._id.toString(), {
      recoveryCode: {
        code: recoveryPassToken,
        isUsed: false,
      },
    });

    await emailService.sendRecoveryPassEmail(email, recoveryPassToken);

    return { data: null, status: ResultStatus.Success };
  };

  async newPass(newPassword: string, recoveryCode: string) {

    const { userId, exp } = (jwtService.verifyToken(recoveryCode) as JwtPayload) ?? {};

    if (!userId || !exp) {
      return {
        status: ResultStatus.BadRequest,
        data: { errorsMessages: [{ message: 'Recovery Cod not correct', field: 'recoveryCode' }] },
      };
    }

    if (isExpiredDate(fromUnixTimeToISO(exp), getCurrentDate())) {
      return {
        status: ResultStatus.BadRequest,
        data: { errorsMessages: [{ message: 'Recovery Cod not correct', field: 'recoveryCode' }] },
      };
    }

    const { data: user, status } = await userRepository.getUserByFields(['_id'], userId);

    if (user?.recoveryCode?.isUsed || user?.recoveryCode?.code !== recoveryCode) {
      return {
        status: ResultStatus.BadRequest,
        data: { errorsMessages: [{ message: 'Recovery Cod not correct', field: 'recoveryCode' }] },
      };
    }

    const passwordHash = await hashBuilder.hash(newPassword);

    await userRepository.updateUserById(user!._id.toString(), {
      password: passwordHash,
      recoveryCode: {
        isUsed: true,
      },
    });

    return { data: null, status: ResultStatus.Success };
  };
}

export const authService = new AuthService();

