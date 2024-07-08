import { ObjectId } from 'mongodb';
import { Result, ResultStatus } from '../types/common/result';
import { subtractSeconds } from '../utils/dates/dates';
import { visitRepository } from '../repositories/visit-repository';
import { Visit } from '../dto/new-visit-dto';

class VisitService {
  async calculateVisit(ip: string, url: string): Promise<Result<string | null>> {
    try {
      const totalCount: number = await visitRepository.getDocumentsCount(ip, url, subtractSeconds(new Date(), 10));

      if (totalCount > 4) {
        return { status: ResultStatus.BadRequest, data: null };
      }

      const visit = new Visit(ip, url);

      const { data: visitId } = await visitRepository.createVisit(visit);

      return { data: visitId, status: ResultStatus.Success };

    } catch (error) {
      console.log(`Visit not created: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  }
}

export const visitService = new VisitService();
