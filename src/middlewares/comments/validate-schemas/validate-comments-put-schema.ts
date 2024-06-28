import { checkSchema } from 'express-validator';

export const validateCommentsPutSchema = () => {
  return checkSchema({
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
        options: { min: 20, max: 300 },
        errorMessage: 'Max length 20, min length 300',
      },
    },
  });
};
