import { getPageCount } from '../utils/helpers';
import { BlogDTO } from './blog-dto';

export class BlogListDTO{
  items: BlogDTO[];
  totalCount: number;
  pageSize: number;
  page: number
  pagesCount: number

  constructor(
    items: BlogDTO[],
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
