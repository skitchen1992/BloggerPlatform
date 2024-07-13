import { ErrorMessageResponseView } from '../../view-model';

export enum ResultStatus {
  Success = 'Success',
  NotFound = 'NotFound',
  Forbidden = 'Forbidden',
  Unauthorized = 'Unauthorized',
  BadRequest = 'BadRequest',
}

export type Result<T> = {
  status: ResultStatus;
  data: T;
  errorMessage?: ErrorMessageResponseView[];
};
