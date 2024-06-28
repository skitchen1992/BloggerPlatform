import { ErrorMessageSchema } from './ErrorMessageSchema';

export type ResponseErrorSchema = {
  errorsMessages: ErrorMessageSchema[];
};
