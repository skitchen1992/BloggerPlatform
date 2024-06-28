import {
  Collection,
  DeleteResult,
  Filter,
  InsertOneResult,
  MatchKeysAndValues,
  ObjectId,
  OptionalUnlessRequiredId,
  UpdateResult,
  WithId,
} from 'mongodb';
import { Document } from 'bson';

export interface GetQuerySettings {
  query?: any;
  sort?: any;
  skip: number;
  pageSize: number;
}
abstract class DbRepository {
  abstract get<T extends Document>(collection: Collection<T>, settings: GetQuerySettings): Promise<WithId<T>[]>;

  abstract getById<T extends Document>(collection: Collection<T>, id: string): Promise<WithId<T> | null>;

  abstract add<T extends Document>(
    collection: Collection<T>,
    data: OptionalUnlessRequiredId<T>
  ): Promise<InsertOneResult<T>>;

  abstract update<T extends Document>(
    collection: Collection<T>,
    id: string,
    data: MatchKeysAndValues<T>
  ): Promise<UpdateResult<T>>;

  abstract delete<T extends Document>(collection: Collection<T>, id: string): Promise<DeleteResult>;
}

export class MongoDB extends DbRepository {
  public async get<T extends Document>(collection: Collection<T>, settings: GetQuerySettings): Promise<WithId<T>[]> {
    const { query, sort, skip, pageSize } = settings;

    return collection.find(query).sort(sort).skip(skip).limit(pageSize).toArray();
  }

  public async find<T extends Document>(collection: Collection<T>, settings: Filter<T>): Promise<WithId<T>[]> {
    return collection.find(settings).toArray();
  }

  public async getById<T extends Document>(collection: Collection<T>, id: string): Promise<WithId<T> | null> {
    const filter = { _id: new ObjectId(id) } as Filter<T>;

    return await collection.findOne(filter);
  }

  public async getByField<T extends Document>(
    collection: Collection<T>,
    fields?: string | string[],
    value?: string
  ): Promise<WithId<T> | null> {
    let filter: Filter<T>;

    if (typeof fields === 'string') {
      filter = { [fields]: value } as Filter<T>;
    } else {
      filter = { $or: fields?.map((field) => ({ [field]: value })) } as Filter<T>;
    }

    return await collection.findOne(filter);
  }

  public async add<T extends Document>(
    collection: Collection<T>,
    data: OptionalUnlessRequiredId<T>
  ): Promise<InsertOneResult<T>> {
    return await collection.insertOne(data);
  }

  public async update<T extends Document>(
    collection: Collection<T>,
    id: string,
    data: MatchKeysAndValues<T>
  ): Promise<UpdateResult<T>> {
    const filter = { _id: new ObjectId(id) } as Filter<T>;
    return await collection.updateOne(filter, { $set: data });
  }

  public async delete<T extends Document>(collection: Collection<T>, id: string): Promise<DeleteResult> {
    const filter = { _id: new ObjectId(id) } as Filter<T>;
    return await collection.deleteOne(filter);
  }

  public async getTotalCount<T extends Document>(collection: Collection<T>, filters?: Filter<T>): Promise<number> {
    return await collection.countDocuments(filters);
  }
}

export const mongoDBRepository = new MongoDB();
