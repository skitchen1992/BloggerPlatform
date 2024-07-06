import { getPageCount } from '../utils/helpers';
import { CommentDTO } from './comment-dto';

export class CommentListDTO{
  items: CommentDTO[];
  totalCount: number;
  pageSize: number;
  page: number
  pagesCount: number

  constructor(
    items: CommentDTO[],
    totalCount: number,
    pageSize: number,
    page: number
  ) {
    this.pagesCount = getPageCount(totalCount, pageSize);
    this.page = page;
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    this.items = items;
  }
}
