export type EmailConfirmationWithId = EmailConfirmation & {
  id: string;
};

export type EmailConfirmation = {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
};

export type UserDbType = {
  login: string;
  email: string;
  password: string;
  createdAt: string;
  emailConfirmation?: EmailConfirmation;
};

export interface IUserByEmail {
  confirmationCode: string;
  email: string;
  expirationDate: string;
  isConfirmed: boolean;
  id: string;
}

export type GetUsersQuery = {
  /**
   * Search term for user Login: Login should contain this term in any position
   * Default value : null
   */
  searchLoginTerm?: string;
  /**
   * Default value : createdAt
   */
  sortBy?: string;
  /**
   * Default value: desc
   * Available values : asc, desc
   */
  sortDirection?: 'asc' | 'desc';
  /**
   * pageNumber is number of portions that should be returned
   * Default value : 1
   */
  pageNumber?: string;
  /**
   * pageSize is portions size that should be returned
   * Default value : 10
   */
  pageSize?: string;
  /**
   * Search term for user Email: Email should contains this term in any position
   * Default value : null
   */
  searchEmailTerm?: string;
};
