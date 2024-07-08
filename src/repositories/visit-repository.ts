import { IVisitSchema, VisitModel } from '../models/visit';
import { Result, ResultStatus } from '../types/common/result';

class VisitRepository {
  async getDocumentsCount(ip: string, url: string, date: string): Promise<number> {
    const filters = {
      ip,
      url,
      date: { $gte: date },
    };

    return VisitModel.countDocuments(filters);
  }

  async createVisit(obj: IVisitSchema): Promise<Result<string | null>> {
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

export const visitRepository = new VisitRepository();
