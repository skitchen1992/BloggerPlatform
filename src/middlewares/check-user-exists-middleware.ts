import { body, oneOf } from 'express-validator';
import { param } from 'express-validator/src/middlewares/validation-chain-builders';
import { ResultStatus } from '../types/common/result';
import { userRepository } from '../repositories/user-repository';

export const checkUserExistsMiddleware = {
  body: (fields?: string | string[]) => {
    return oneOf(
      [
        body(fields).custom(async (input, meta) => {
          const { status } = await userRepository.isExistsUser(input, meta.path);

          if (status === ResultStatus.BadRequest) {
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
          const { status } = await userRepository.isExistsUser(input, meta.path);

          if (status === ResultStatus.BadRequest) {
            throw new Error();
          }
        }),
      ],
      { message: 'Email and login should be unique' }
    );
  },
};
