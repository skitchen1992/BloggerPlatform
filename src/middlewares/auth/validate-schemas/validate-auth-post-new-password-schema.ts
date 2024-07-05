import { checkSchema } from 'express-validator';

export const validateAuthPostNewPasswordSchema = () => {
  return checkSchema({
    newPassword: {
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
    recoveryCode:{
      exists: {
        bail: true,
        errorMessage: 'Is required',
      },
      isString: {
        bail: true,
        errorMessage: 'Not a string',
      },
      trim: {},
    }
  });
};
