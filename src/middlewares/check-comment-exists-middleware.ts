import { body } from 'express-validator';
import { param } from 'express-validator/src/middlewares/validation-chain-builders';
import { ResultStatus } from '../types/common/result';
import { commentRepository } from '../compositions/composition-root';

export const checkCommentExistsMiddleware = {
  body: (fields?: string | string[]) => {
    return body(fields).custom(async (input, meta) => {
      if (meta.path === 'commentId') {
        const { status } = await commentRepository.isExistComment(input);


        if (status !== ResultStatus.Success) {
          throw new Error('Comment is not founded');
        }
      }
    });
  },
  urlParams: (fields?: string | string[]) => {
    return param(fields).custom(async (input, meta) => {
      if (meta.path === 'commentId') {
        const { status } = await commentRepository.isExistComment(input);

        if (status !== ResultStatus.Success) {
          throw new Error('Comment is not founded');
        }
      }
    });
  },
};




