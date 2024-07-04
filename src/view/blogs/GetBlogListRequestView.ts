import { GetBlogResponseView } from './GetBlogResponseView';

export type GetBlogListRequestView = {
  items: GetBlogResponseView[];
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};
