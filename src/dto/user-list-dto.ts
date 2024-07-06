import { UserDTO } from './user-dto';
import { getPageCount } from '../utils/helpers';

export class UserListDTO{
  items: UserDTO[];
  totalCount: number;
  pageSize: number;
  page: number
  pagesCount: number

  constructor(
    items: UserDTO[],
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
