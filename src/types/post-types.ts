export type PostDbType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};

export type GetPostsQuery = {
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
