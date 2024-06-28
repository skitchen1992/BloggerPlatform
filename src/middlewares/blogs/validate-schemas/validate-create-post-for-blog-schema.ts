import { checkSchema } from 'express-validator';

export const validateCreatePostForBlogSchema = () => {
  return checkSchema({
    title: {
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
        options: { min: 1, max: 30 },
        errorMessage: 'Max length 30',
      },
    },
    shortDescription: {
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
    content: {
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
        options: { min: 1, max: 1000 },
        errorMessage: 'Max length 1000',
      },
    },
  });
};
