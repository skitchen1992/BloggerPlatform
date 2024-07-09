import { Result, ResultStatus } from '../types/common/result';
import { ILikeSchema, LikeModel, ParentType } from '../models/like';
import { UpdateQuery } from 'mongoose';
import { ObjectId } from 'mongodb';

export class LikeRepository {

  public async createLike(obj: ILikeSchema): Promise<Result<string | null>> {
    try {
      const data = new LikeModel(obj);

      await data.save();

      return { data: data._id.toString(), status: ResultStatus.Success };
    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }

  public async isExistsLike(userId: string, commentId: string, parentType: ParentType): Promise<Result<ILikeSchema | null>> {
    const like = await LikeModel.findOne({
      $and: [{ authorId: userId }, { parentId: commentId }, { parentType }],
    }).lean();

    if (like) {
      return { data: like, status: ResultStatus.Success };
    } else {
      return { data: null, status: ResultStatus.NotFound };
    }
  }

  async updateLikeById(id: string, data: UpdateQuery<ILikeSchema>): Promise<Result<null>> {
    try {

      const updateResult = await LikeModel.updateOne({ _id: new ObjectId(id) }, data);

      if (updateResult.modifiedCount === 1) {
        return { data: null, status: ResultStatus.Success };
      } else {
        return { data: null, status: ResultStatus.NotFound };
      }

    } catch (e) {
      console.log(e);
      return { data: null, status: ResultStatus.BadRequest };
    }
  }
}
