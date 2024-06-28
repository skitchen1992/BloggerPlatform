import { checkSchema } from 'express-validator';

export const validateUserPostSchema = () => {
  return checkSchema({
    login: {
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
        options: { min: 3, max: 10 },
        errorMessage: 'Max length 10',
      },
    },
    password: {
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
        options: { min: 6, max: 20 },
        errorMessage: 'Max length 20',
      },
    },
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
