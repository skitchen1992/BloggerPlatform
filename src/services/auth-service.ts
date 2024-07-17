import { getUniqueId, hashBuilder } from '../utils/helpers';
import { ResultStatus } from '../types/common/result';
import { fromUnixTimeToISO, getCurrentDate, isExpiredDate } from '../utils/dates/dates';
import {
  ACCESS_TOKEN_EXPIRED_IN,
  RECOVERY_PASS_TOKEN_EXPIRED,
  REFRESH_TOKEN_EXPIRED_IN,
} from '../utils/consts';
import { JwtPayload } from 'jsonwebtoken';
import { Session } from '../dto/new-session-dto';
import { UserRepository } from '../repositories/user-repository';
import { JwtService } from './jwt-service';
import { EmailService } from './email-service';
import { SessionRepository } from '../repositories/session-repository';


type Payload = {
  userId: string;
  ip: string;
  title: string;
};

export class AuthService {

  constructor(protected userRepository: UserRepository,
              protected jwtService: JwtService,
              protected emailService: EmailService,
              protected sessionRepository: SessionRepository,
  ) {
  }

  async addTokenToUser(payload: Payload) {
    try {
      const { userId, ip, title } = payload;

      const deviceId = getUniqueId();

      const accessToken = this.jwtService.generateToken({ userId }, { expiresIn: ACCESS_TOKEN_EXPIRED_IN });

      const refreshToken = this.jwtService.generateToken({ userId, deviceId }, { expiresIn: REFRESH_TOKEN_EXPIRED_IN });

      const session = new Session(
        userId,
        ip,
        title,
        getCurrentDate(),
        getCurrentDate(),
        this.jwtService.getTokenExpirationDate(refreshToken),
        deviceId);

      await this.sessionRepository.createSession(session);

      return { status: ResultStatus.Success, data: { refreshToken, accessToken } };
    } catch (error) {
      console.log(`Token not added: ${error}`);
      return { status: ResultStatus.NotFound, data: null };
    }
  };

  async refreshToken(userId: string, deviceId: string, exp: number) {
    try {
      const { data: device } = await this.sessionRepository.getDeviceByFields(
        ['deviceId'],
        deviceId,
      );

      if (!device?.tokenExpirationDate) {
        return { status: ResultStatus.Unauthorized, data: null };
      }

      if (device.tokenExpirationDate !== fromUnixTimeToISO(exp)) {
        return { status: ResultStatus.Unauthorized, data: null };
      }

      const newAccessToken = this.jwtService.generateToken({ userId }, { expiresIn: ACCESS_TOKEN_EXPIRED_IN });
      const newRefreshToken = this.jwtService.generateToken({
        userId,
        deviceId,
      }, { expiresIn: REFRESH_TOKEN_EXPIRED_IN });

      await this.sessionRepository.updateSessionById(device._id.toString(), {
        tokenExpirationDate: this.jwtService.getTokenExpirationDate(newRefreshToken),
        lastActiveDate: getCurrentDate(),
      });

      return { status: ResultStatus.Success, data: { refreshToken: newRefreshToken, accessToken: newAccessToken } };

    } catch (error) {
      console.log(`Token not added: ${error}`);
      return { status: ResultStatus.Unauthorized, data: null };
    }

  }

  async logout(refreshToken: string) {
    const { userId, deviceId, exp } = (this.jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

    if (!userId || !deviceId || !exp) {
      return { status: ResultStatus.Unauthorized, data: null };
    }

    const { data: device } = await this.sessionRepository.getDeviceByFields(
      ['deviceId'],
      deviceId,
    );

    if (!device?.tokenExpirationDate) {
      return { status: ResultStatus.Unauthorized, data: null };
    }

    if (device.tokenExpirationDate !== fromUnixTimeToISO(exp)) {
      return { status: ResultStatus.Unauthorized, data: null };
    }

    await this.sessionRepository.deleteSessionById(device._id.toString());

    return { data: null, status: ResultStatus.Success };
  };

  async recoveryPass(email: string) {
    const { data: user, status } = await this.userRepository.getUserByFields(['email'], email);

    if (status === ResultStatus.NotFound) {
      const recoveryPassToken = this.jwtService.generateToken({ userId: null }, { expiresIn: RECOVERY_PASS_TOKEN_EXPIRED });

      await this.emailService.sendRecoveryPassEmail(email, recoveryPassToken);

      return { status: ResultStatus.Success, data: null };
    }

    const recoveryPassToken = this.jwtService.generateToken({ userId: user?._id.toString() }, { expiresIn: RECOVERY_PASS_TOKEN_EXPIRED });

    await this.userRepository.updateUserById(user!._id.toString(), {
      recoveryCode: {
        code: recoveryPassToken,
        isUsed: false,
      },
    });

    await this.emailService.sendRecoveryPassEmail(email, recoveryPassToken);

    return { data: null, status: ResultStatus.Success };
  };

  async newPass(newPassword: string, recoveryCode: string) {

    const { userId, exp } = (this.jwtService.verifyToken(recoveryCode) as JwtPayload) ?? {};

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

    const { data: user, status } = await this.userRepository.getUserByFields(['_id'], userId);

    if (user?.recoveryCode?.isUsed || user?.recoveryCode?.code !== recoveryCode) {
      return {
        status: ResultStatus.BadRequest,
        data: { errorsMessages: [{ message: 'Recovery Cod not correct', field: 'recoveryCode' }] },
      };
    }

    const passwordHash = await hashBuilder.hash(newPassword);

    await this.userRepository.updateUserById(user!._id.toString(), {
      password: passwordHash,
      recoveryCode: {
        isUsed: true,
      },
    });

    return { data: null, status: ResultStatus.Success };
  };
}
