import { IVisitSchema, VisitModel } from '../models/visit';
import { Result, ResultStatus } from '../types/common/result';
import { Visit } from '../dto/new-visit-dto';

export class VisitRepository {
  async getDocumentsCount(ip: string, url: string, date: string): Promise<number> {
    const filters = {
      ip,
      url,
      date: { $gte: date },
    };

    return VisitModel.countDocuments(filters);
  }

  async createVisit(obj: Visit): Promise<Result<string | null>> {
    try {
      const visit = new VisitModel(obj);

      await visit.save();

      return { data: visit._id.toString(), status: ResultStatus.Success };
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }

  }
}
