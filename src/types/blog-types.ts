export type BlogDbType = {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt?: string;
  isMembership?: boolean;
};

export type GetBlogsQuery = {
  /**
   * Search term for blog Name: Name should contain this term in any position
   * Default value : null
   */
  searchNameTerm?: string;
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
};
