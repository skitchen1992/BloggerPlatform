import { GetUserSchema } from './GetUserSchema';

export type GetUserListSchema = {
  items: GetUserSchema[];
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};
