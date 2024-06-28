import { UserDTO } from '../../dto/user-dto';

export type GetUserListView = {
  items: UserDTO[];
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};
