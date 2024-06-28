import { query } from 'express-validator';

export const sanitizerQueryMiddleware = (fields?: string | string[]) => {
  return query(fields).trim().escape();
};
