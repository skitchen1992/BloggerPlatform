import { body } from 'express-validator';
import { param } from 'express-validator/src/middlewares/validation-chain-builders';
import { ResultStatus } from '../types/common/result';
import { postRepository } from '../repositories/post-repository';

export const checkPostExistsMiddleware = {
  body: (fields?: string | string[]) => {
    return body(fields).custom(async (input, meta) => {
      if (meta.path === 'postId') {
        const { status } = await postRepository.getPostById(input);

        if (status !== ResultStatus.Success) {
          throw new Error('Post is not founded');
        }
      }
    });
  },
  urlParams: (fields?: string | string[]) => {
    return param(fields).custom(async (input, meta) => {
      if (meta.path === 'postId') {
        const { status } = await postRepository.getPostById(input);

        if (status !== ResultStatus.Success) {
          throw new Error('Post is not founded');
        }
      }
    });
  },
};
