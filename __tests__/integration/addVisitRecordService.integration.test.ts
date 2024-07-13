import { testSeeder } from '../test.seeder';
import { ResultStatus } from '../../src/types/common/result';
import { VisitModel } from '../../src/models/visit';
import { visitService } from '../../src/compositions/composition-root';

describe('addVisitRecordService', () => {

  it(`Should get ${ResultStatus.BadRequest} if totalCount is greater than 5`, async () => {
    await VisitModel.insertMany(testSeeder.createDocumentsListDto(5));

    const result = await visitService.calculateVisit('1', 'url');

    expect(result).toEqual({ status: ResultStatus.BadRequest, data: null });
  });

  it(`Should get ${ResultStatus.Success} if totalCount is greater than 5`, async () => {
    await VisitModel.insertMany(testSeeder.createDocumentsListDto(1));

    const result = await visitService.calculateVisit('1', 'url');

    expect(result.status).toEqual(ResultStatus.Success);
  });
});

