import { Result, ResultStatus } from '../types/common/result';
import { SessionModel, ISessionSchema } from '../models/session';
import { getCurrentDate } from '../utils/dates/dates';
import { SessionMapper } from '../mappers/session-mapper';
import { UpdateQuery } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Session } from '../dto/new-session-dto';

export class SessionRepository {
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

  async createSession(obj: Session): Promise<Result<string | null>> {
    try {
      const data = new SessionModel(obj);

      await data.save();

      return { data: data._id.toString(), status: ResultStatus.Success };
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  async updateSessionById(id: string, data: UpdateQuery<ISessionSchema>): Promise<Result<null>> {
    try {

      await SessionModel.updateOne({ _id: new ObjectId(id) }, data);

      return { data: null, status: ResultStatus.Success };
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  async deleteSessionById(id: string): Promise<Result<null>> {
    try {
      const session = await SessionModel.findByIdAndDelete(new ObjectId(id));

      if (session) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  async deleteSessionByDeviceId(id: string): Promise<Result<null>> {
    try {
      const session = await SessionModel.deleteOne({ deviceId: id });

      if (session) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  async deleteSessionList(): Promise<Result<null>> {
    try {
      await SessionModel.deleteMany({});

      return { data: null, status: ResultStatus.Success };
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }
}
