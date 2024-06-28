import { ErrorMessageSchema } from '../../Veiw/errors/ErrorMessageSchema';

export enum ResultStatus {
  Success = 'Success',
  NotFound = 'NotFound',
  Forbidden = 'Forbidden',
  Unauthorized = 'Unauthorized',
  BadRequest = 'BadRequest',
}

export type Result<T> = {
  status: ResultStatus;
  errorMessage?: ErrorMessageSchema[];
  data: T;
};
