import { UserDTO } from '../../dto/user-dto';

export type GetUserListResponseView = {
  items: UserDTO[];
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};
