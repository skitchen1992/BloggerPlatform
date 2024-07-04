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
  const uri = mongoServer.getUri();

  if (!db.isConnected()) {

    await db.connect(uri);
  }

  req = agent(app);
});

afterEach(async () => {
  await db.dropDB();
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
