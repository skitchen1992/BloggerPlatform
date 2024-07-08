import { body } from 'express-validator';
import { param } from 'express-validator/src/middlewares/validation-chain-builders';
import { ResultStatus } from '../types/common/result';
import { blogRepository } from '../compositions/composition-root';

export const checkBlogExistsMiddleware = {
  body: (fields?: string | string[]) => {
    return body(fields).custom(async (input, meta) => {
      if (meta.path === 'blogId') {
        const { status } = await blogRepository.getBlogById(input);

        if (status !== ResultStatus.Success) {
          throw new Error('Blog is not founded');
        }
      }
    });
  },
  urlParams: (fields?: string | string[]) => {
    return param(fields).custom(async (input, meta) => {
      if (meta.path === 'blogId') {
        const { status } = await blogRepository.getBlogById(input);

        if (status !== ResultStatus.Success) {
          throw new Error('Blog is not founded');
        }
      }
    });
  },
};
