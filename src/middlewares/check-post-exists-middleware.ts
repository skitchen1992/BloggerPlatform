import { body } from 'express-validator';
import { param } from 'express-validator/src/middlewares/validation-chain-builders';
import { queryRepository } from '../repositories/queryRepository';
import { ResultStatus } from '../types/common/result';

export const checkPostExistsMiddleware = {
  body: (fields?: string | string[]) => {
    return body(fields).custom(async (input, meta) => {
      if (meta.path === 'postId') {
        const { status } = await queryRepository.getPostById(input);

        if (status !== ResultStatus.Success) {
          throw new Error('Post is not founded');
        }
      }
    });
  },
  urlParams: (fields?: string | string[]) => {
    return param(fields).custom(async (input, meta) => {
      if (meta.path === 'postId') {
        const { status } = await queryRepository.getPostById(input);

        if (status !== ResultStatus.Success) {
          throw new Error('Post is not founded');
        }
      }
    });
  },
};
