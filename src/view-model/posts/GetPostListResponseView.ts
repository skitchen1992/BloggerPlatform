import { GetPostResponseView } from './GetPostResponseView';

export type GetPostListResponseView = {
  items: GetPostResponseView[];
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};
