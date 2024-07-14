import { GetBlogsQuery } from '../types/blog-types';
import { GetPostsQuery } from '../types/post-types';
import { GetUsersQuery } from '../types/users-types';

export const HTTP_STATUSES = {
  OK_200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,
  BAD_REQUEST_400: 400,
  UNAUTHORIZED_401: 401,
  FORBIDDEN_403: 403,
  NOT_FOUND_404: 404,
  METHOD_NOT_ALLOWED_405: 405,
  TOO_MANY_REQUESTS_429: 429,
  INTERNAL_SERVER_ERROR_500: 500,
  BAD_GATEWAY_502: 502,
  SERVICE_UNAVAILABLE_503: 503,
  GATEWAY_TIMEOUT_504: 504,
};

export const PATH_URL = {
  ROOT: '/',
  ID: '/:id',
  COMMENT_ID: '/:commentId',
  BLOGS: '/blogs',
  POSTS_FOR_BLOG: '/:blogId/posts',
  COMMENT_FOR_POST: '/:postId/comments',
  LIKE_STATUS: '/:commentId/like-status',
  COMMENTS: '/comments',
  POSTS: '/posts',
  USERS: '/users',
  TESTING: {
    ROOT: '/testing',
    ALL_DATA: '/all-data',
  },
  AUTH: {
    ROOT: '/auth',
    LOGIN: '/login',
    PASSWORD_RECOVERY: '/password-recovery',
    NEW_PASSWORD: '/new-password',
    ME: '/me',
    REGISTRATION: '/registration',
    REGISTRATION_CONFIRMATION: '/registration-confirmation',
    REGISTRATION_EMAIL_RESENDING: '/registration-email-resending',
    REFRESH_TOKEN: '/refresh-token',
    LOGOUT: '/logout',
  },
  SECURITY: {
    ROOT: '/security',
    DEVICES: '/devices',
    DEVICE_ID: '/devices/:deviceId',
  },
};

export const COOKIE_KEY = {
  REFRESH_TOKEN: 'refreshToken',
};

export const ACCESS_TOKEN_EXPIRED_IN = "1d";
export const REFRESH_TOKEN_EXPIRED_IN = 20;
export const RECOVERY_PASS_TOKEN_EXPIRED = "1h";
export const NEWEST_LIKES_COUNT = 3;

export const getBlogsQueryParams: (keyof Required<GetBlogsQuery>)[] = [
  'searchNameTerm',
  'sortBy',
  'sortDirection',
  'pageNumber',
  'pageSize',
];

export const getPostsQueryParams: (keyof Required<GetPostsQuery>)[] = [
  'sortBy',
  'sortDirection',
  'pageNumber',
  'pageSize',
];

export const getUsersQueryParams: (keyof Required<GetUsersQuery>)[] = [
  'sortBy',
  'sortDirection',
  'pageNumber',
  'pageSize',
  'searchLoginTerm',
  'searchEmailTerm',
];

export const DEFAULT_SORT = 'desc';
export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 10;
