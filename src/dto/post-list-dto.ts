import { getPageCount } from '../utils/helpers';
import { PostDTO } from './post-dto';

export class PostListDTO{
  items: PostDTO[];
  totalCount: number;
  pageSize: number;
  page: number
  pagesCount: number

  constructor(
    items: PostDTO[],
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
