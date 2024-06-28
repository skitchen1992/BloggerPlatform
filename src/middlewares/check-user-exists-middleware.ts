import { body, oneOf } from 'express-validator';
import { param } from 'express-validator/src/middlewares/validation-chain-builders';
import { queryRepository } from '../repositories/queryRepository';
import { ResultStatus } from '../types/common/result';

export const checkUserExistsMiddleware = {
  body: (fields?: string | string[]) => {
    return oneOf(
      [
        body(fields).custom(async (input, meta) => {
          const { status } = await queryRepository.isExistsUser(input, meta.path);

          if (status === ResultStatus.BagRequest) {
            throw new Error();
          }
        }),
      ],
      { message: 'Email and login should be unique' }
    );
  },
  urlParams: (fields?: string | string[]) => {
    return oneOf(
      [
        param(fields).custom(async (input, meta) => {
          const { status } = await queryRepository.isExistsUser(input, meta.path);

          if (status === ResultStatus.BagRequest) {
            throw new Error();
          }
        }),
      ],
      { message: 'Email and login should be unique' }
    );
  },
};
