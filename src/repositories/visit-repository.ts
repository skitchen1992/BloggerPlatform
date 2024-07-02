import { VisitModel } from '../models/visit';

class VisitRepository {
  async getDocumentsCount(ip: string, url: string, date: string): Promise<number> {
    const filters = {
      ip,
      url,
      date: { $gte: new Date(date) }, // Ensure date is converted to Date object
    };

    return await VisitModel.countDocuments(filters);
  }

}

export const visitRepository = new VisitRepository();
