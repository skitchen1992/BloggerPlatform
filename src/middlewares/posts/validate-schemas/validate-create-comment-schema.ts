import { checkSchema } from 'express-validator';

export const validateCreateCommentSchema = () => {
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
        errorMessage: 'Min length 20, max length 300',
      },
    },
  });
};
