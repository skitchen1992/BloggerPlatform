import { checkSchema } from 'express-validator';

export const validateBlogPostSchema = () => {
  return checkSchema({
    name: {
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
        options: { min: 1, max: 15 },
        errorMessage: 'Max length 15',
      },
    },
    description: {
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
        options: { min: 1, max: 500 },
        errorMessage: 'Max length 500',
      },
    },
    websiteUrl: {
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
        bail: true,
        options: { min: 1, max: 100 },
        errorMessage: 'Max length 100',
      },
      isURL: {
        errorMessage: 'URL is not correct',
      },
    },
  });
};
