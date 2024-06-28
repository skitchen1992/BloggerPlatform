import { Request, Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import {
  blogsCollection,
  commentsCollection,
  documentsCollection,
  postsCollection,
  deviceAuthSessionsCollection,
  usersCollection,
} from '../../db/collection';

export const deleteAllDataController = async (req: Request, res: Response) => {
  try {
    await blogsCollection.deleteMany({});
    await postsCollection.deleteMany({});
    await usersCollection.deleteMany({});
    await commentsCollection.deleteMany({});
    await deviceAuthSessionsCollection.deleteMany({});
    await documentsCollection.deleteMany({});

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  } catch (e) {
    console.log(e);
  }
};
