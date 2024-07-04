import TestAgent from 'supertest/lib/agent';
import { agent, Test } from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app';
import { testSeeder } from '../test.seeder';
import { ResultStatus } from '../../src/types/common/result';
import { visitService } from '../../src/services/visit-service';
import { db } from '../../src';
import { VisitModel } from '../../src/models/visit';

let req: TestAgent<Test>;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await db.connect(mongoServer.getUri());

  req = agent(app);
});

beforeEach(async () => {
  await db.cleanDB();
})

afterAll(async () => {
  await db.dropDB();
  await db.disconnect();
  await mongoServer.stop();
});

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
