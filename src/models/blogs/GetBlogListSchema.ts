import { GetBlogSchema } from './GetBlogSchema';

export type GetBlogListSchema = {
  items: GetBlogSchema[];
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};
