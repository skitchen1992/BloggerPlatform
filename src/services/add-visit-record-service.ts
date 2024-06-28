import { ObjectId } from 'mongodb';
import { mongoDBRepository } from '../repositories/db-repository';
import { documentsCollection } from '../db/collection';
import { ResultStatus } from '../types/common/result';
import { DocumentDbType } from '../types/documents-types';
import { getDateFromObjectId, subtractSeconds } from '../utils/dates/dates';
import { queryRepository } from '../repositories/queryRepository';

export const addVisitRecordService = async (ip: string, url: string) => {
  const totalCount: number = await queryRepository.getDocumentsCount(ip, url, subtractSeconds(new Date(), 10));

  if (totalCount > 4) {
    return { status: ResultStatus.BadRequest, data: null };
  }

  const objectId = new ObjectId();

  const data: DocumentDbType = {
    ip,
    url,
    date: getDateFromObjectId(objectId),
    _id: objectId,
  };

  const insertOneResult = await mongoDBRepository.add<DocumentDbType>(documentsCollection, data);

  if (insertOneResult.insertedId) {
    return { status: ResultStatus.Success, data: insertOneResult.insertedId.toString() };
  } else {
    return { status: ResultStatus.BadRequest, data: null };
  }
};
