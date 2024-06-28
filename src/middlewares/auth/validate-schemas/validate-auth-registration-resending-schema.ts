import { checkSchema } from 'express-validator';

export const validateAuthRegistrationResendingSchema = () => {
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
      isEmail: {
        errorMessage: 'Email is not correct',
      },
    },
  });
};
