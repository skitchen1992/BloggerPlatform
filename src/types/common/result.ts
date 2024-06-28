import { ErrorMessageSchema } from '../../models/errors/ErrorMessageSchema';

export enum ResultStatus {
  Success = 'Success',
  NotFound = 'NotFound',
  Forbidden = 'Forbidden',
  Unauthorized = 'Unauthorized',
  BagRequest = 'BagRequest',
}

export type Result<T = null> = {
  status: ResultStatus;
  errorMessage?: ErrorMessageSchema[];
  data: T;
};
