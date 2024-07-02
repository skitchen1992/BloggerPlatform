import { Request, Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { BlogModel } from '../../models/blog';
import { PostModel } from '../../models/post';
import { UserModel } from '../../models/user';
import { CommentModel } from '../../models/comment';
import { SessionModel } from '../../models/session';
import { VisitModel } from '../../models/visit';

export const deleteAllDataController = async (req: Request, res: Response) => {
  try {
    await BlogModel.deleteMany({});
    await PostModel.deleteMany({});
    await UserModel.deleteMany({});
    await CommentModel.deleteMany({});
    await SessionModel.deleteMany({});
    await VisitModel.deleteMany({});

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  } catch (e) {
    console.log(e);
  }
};
