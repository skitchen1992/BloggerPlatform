import { ObjectId } from 'mongodb';
import { Result, ResultStatus } from '../types/common/result';
import { getDateFromObjectId, subtractSeconds } from '../utils/dates/dates';
import { visitRepository } from '../repositories/visit-repository';
import { VisitModel } from '../models/visit';

class VisitService {
  async calculateVisit(ip: string, url: string): Promise<Result<string | null>> {
    try {
      const totalCount: number = await visitRepository.getDocumentsCount(ip, url, subtractSeconds(new Date(), 10));

      if (totalCount > 4) {
        return { status: ResultStatus.BadRequest, data: null };
      }

      const objectId = new ObjectId();

      const newVisit = new VisitModel({
        ip,
        url,
        date: getDateFromObjectId(objectId),
        _id: objectId,
      });


      const savedVisit = await newVisit.save();

      return { data: savedVisit._id.toString(), status: ResultStatus.Success };

    } catch (error) {
      console.log(`Visit not created: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  }
}

export const visitService = new VisitService();
