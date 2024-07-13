import { checkSchema } from 'express-validator';
import { LikeStatus } from '../../../models/like';

export const validateCommentsPutLikeStatusSchema = () => {
  return checkSchema({
    likeStatus: {
      custom: {
        options: (value) => {
          return Object.values(LikeStatus).includes(value);
        },
        errorMessage: `Must be one of: ${Object.values(LikeStatus).join(', ')}`,
      },
    },
  });
};
