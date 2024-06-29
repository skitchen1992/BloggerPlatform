import type { GetCommentSchema } from './GetCommentSchema';

export type GetCommentListSchema = {
  items: GetCommentSchema[];
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};
