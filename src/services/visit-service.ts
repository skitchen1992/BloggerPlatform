import { Result, ResultStatus } from '../types/common/result';
import { subtractSeconds } from '../utils/dates/dates';
import { Visit } from '../dto/new-visit-dto';
import { VisitRepository } from '../repositories/visit-repository';

export class VisitService {

  constructor(protected visitRepository: VisitRepository) {
  }
  async calculateVisit(ip: string, url: string): Promise<Result<string | null>> {
    try {
      const totalCount: number = await this.visitRepository.getDocumentsCount(ip, url, subtractSeconds(new Date(), 10));

      if (totalCount > 4) {
        return { status: ResultStatus.BadRequest, data: null };
      }

      const visit = new Visit(ip, url);

      const { data: visitId } = await this.visitRepository.createVisit(visit);

      return { data: visitId, status: ResultStatus.Success };

    } catch (error) {
      console.log(`Visit not created: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  }
}
