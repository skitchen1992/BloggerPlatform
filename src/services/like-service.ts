import { ResultStatus } from '../types/common/result';
import { LikeRepository } from '../repositories/like-repository';
import { Like } from '../dto/new-like-dto';
import { LikeStatus, ParentType } from '../models/like';

export class LikeService {

  constructor(protected likeRepository: LikeRepository) {
  }

  async createLike(status: LikeStatus, userId: string, commentId: string, parentType: ParentType) {
    try {

      const { status: likeStatus, data: like } = await this.likeRepository.isExistsLike(userId, commentId, parentType);

      if (likeStatus === ResultStatus.NotFound) {
        const like = new Like(
          status,
          userId,
          commentId,
          parentType,
        );

        const { data: likeId } = await this.likeRepository.createLike(like);

        return { data: likeId, status: ResultStatus.Success };
      }

      if (likeStatus === ResultStatus.Success && status === like?.status) {
        return { data: like._id.toString(), status: ResultStatus.Success };
      } else {
        const { data: likeId } = await this.likeRepository.updateLikeById(like!._id.toString(), { status });

        return { data: likeId, status: ResultStatus.Success };
      }
    } catch (error) {
      console.log(`Like not created: ${error}`);
      return {
        data: null, status: ResultStatus.BadRequest,
      };
    }
  };
}
