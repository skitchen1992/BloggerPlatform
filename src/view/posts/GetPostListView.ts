import { GetPostVeiw } from './GetPostVeiw';

export type GetPostListView = {
  items: GetPostVeiw[];
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};
