import type { GetCommentResponseView } from './GetCommentResponseView';

export type GetCommentListRequestView = {
  items: GetCommentResponseView[];
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};
