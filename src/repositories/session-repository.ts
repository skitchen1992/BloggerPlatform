import { Result, ResultStatus } from '../types/common/result';
import { SessionModel, ISessionSchema } from '../models/session';
import { getCurrentDate } from '../utils/dates/dates';
import { SessionMapper } from '../mappers/session-mapper';

class SessionRepository {
  public async getDeviceByFields(fields: (keyof ISessionSchema)[], input: string): Promise<Result<ISessionSchema | null>> {
    const queries = fields.map(field => ({ [field]: input }));

    const query = { $or: queries };

    const devise = await SessionModel.findOne(query);

    if (devise) {
      return { data: devise, status: ResultStatus.Success };
    } else {
      return { data: null, status: ResultStatus.NotFound };
    }
  }

  async getDeviceListByUserId(userId: string) {
    const filters = { userId, tokenExpirationDate: { $gt: getCurrentDate() } };

    const sessionList = await SessionModel.find(filters);

    const data = sessionList.map(session => (SessionMapper.toSessionDTO(session)));

    return { data, status: ResultStatus.Success };
  }

}

export const sessionRepository = new SessionRepository();
