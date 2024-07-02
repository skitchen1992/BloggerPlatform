import { ISessionSchema } from '../models/session';
import { SessionDTO } from '../dto/session-dto';

export class SessionMapper {
  static toSessionDTO(session: ISessionSchema): SessionDTO {
    return new SessionDTO(
      session._id.toString(),
      session.title,
      session.lastActiveDate,
      session.deviceId,
    );
  }
}
