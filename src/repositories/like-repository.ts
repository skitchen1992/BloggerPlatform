import { Result, ResultStatus } from '../types/common/result';
import { ILikeSchema, LikeModel } from '../models/like';

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
}
