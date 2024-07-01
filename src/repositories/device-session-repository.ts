import { Result, ResultStatus } from '../types/common/result';
import { DeviceSessionModel, IDeviceSessionSchema } from '../models/device-session';

class DeviceSessionRepository {
  public async getDeviceByFields(fields: (keyof IDeviceSessionSchema)[], input: string): Promise<Result<IDeviceSessionSchema | null>> {
    const query = fields.reduce((acc, field) => {
      acc[field] = input;
      return acc;
    }, {} as { [key: string]: string });

    const devise = await DeviceSessionModel.findOne(query);

    if (devise) {
      return { data: devise, status: ResultStatus.Success };
    } else {
      return { data: null, status: ResultStatus.NotFound };
    }
  }

}

export const deviceSessionRepository = new DeviceSessionRepository();
