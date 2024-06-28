import { checkSchema } from 'express-validator';

export const validateAuthRegistrationConfirmationSchema = () => {
  return checkSchema({
    code: {
      exists: {
        bail: true,
        errorMessage: 'Is required',
      },
      isString: {
        bail: true,
        errorMessage: 'Not a string',
      },
      trim: {},
      isLength: {
        options: { min: 1, max: 100 },
        errorMessage: 'Max length 100',
      },
    },
  });
};
