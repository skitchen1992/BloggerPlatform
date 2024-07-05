import { checkSchema } from 'express-validator';

export const validateAuthPostPasswordRecoverySchema = () => {
  return checkSchema({
    email: {
      exists: {
        bail: true,
        errorMessage: 'Is required',
      },
      isString: {
        bail: true,
        errorMessage: 'Not a string',
      },
      trim: {},
    },
  });
};
