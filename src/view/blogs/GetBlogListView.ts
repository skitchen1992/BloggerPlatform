import { GetBlogSchema } from './GetBlogSchema';

export type GetBlogListView = {
  items: GetBlogSchema[];
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};
