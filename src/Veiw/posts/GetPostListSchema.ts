import { GetPostSchema } from './GetPostSchema';

export type GetPostListSchema = {
  items: GetPostSchema[];
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};
