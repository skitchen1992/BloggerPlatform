import { GetBlogsQuery } from '../types/blog-types';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, DEFAULT_SORT } from './consts';
import { GetPostsQuery } from '../types/post-types';
import { GetUsersQuery } from '../types/users-types';
import { compare, genSalt, hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { SortOrder } from 'mongoose';

export const getPageCount = (totalCount: number, pageSize: number) => {
  return Math.ceil(totalCount / pageSize);
};

export const getUniqueId = () => {
  return uuidv4();
};

export const isValidObjectId = (id: string): boolean => {
  return ObjectId.isValid(id);
};

type Filters = string | { [key: string]: SortOrder | { $meta: any; }; } | [string, SortOrder][] | null | undefined
type Query = Record<string, unknown>

export const searchQueryBuilder = {
  getBlogs: (queryParams: GetBlogsQuery) => {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } = queryParams;

    const query: Query = {};
    if (searchNameTerm) {
      query.name = { $regex: new RegExp(`.*${searchNameTerm}.*`, 'i') };
    }

    const sort: Filters = {};
    if (sortBy) {
      sort[sortBy] = sortDirection || DEFAULT_SORT;
    } else {
      sort.createdAt = sortDirection || DEFAULT_SORT;
      sort._id = 1;
    }

    const defaultPageNumber = Number(pageNumber) || DEFAULT_PAGE_NUMBER;
    const defaultPageSize = Number(pageSize) || DEFAULT_PAGE_SIZE;

    const skip = (defaultPageNumber - 1) * defaultPageSize;

    return { query, sort, skip, pageSize: defaultPageSize, page: defaultPageNumber };
  },

  getPosts: (queryParams: GetPostsQuery, params?: { blogId?: string }) => {
    const { sortBy, sortDirection, pageNumber, pageSize } = queryParams;

    const query: Query = {};
    if (params?.blogId) {
      query.blogId = params.blogId;
    }

    const sort: Filters = {};
    if (sortBy) {
      sort[sortBy] = sortDirection || DEFAULT_SORT;
    } else {
      sort.createdAt = sortDirection || DEFAULT_SORT;
      sort._id = 1;
    }

    const defaultPageNumber = Number(pageNumber) || DEFAULT_PAGE_NUMBER;
    const defaultPageSize = Number(pageSize) || DEFAULT_PAGE_SIZE;

    const skip = (defaultPageNumber - 1) * defaultPageSize;

    return { query, sort, skip, pageSize: defaultPageSize, page: defaultPageNumber };
  },

  getComments: (queryParams: GetPostsQuery, params?: { postId: string }) => {
    const { sortBy, sortDirection, pageNumber, pageSize } = queryParams;

    const query: Query = {};
    if (params?.postId) {
      query.postId = params.postId;
    }

    const sort: Filters = {};
    if (sortBy) {
      sort[sortBy] = sortDirection || DEFAULT_SORT;
    } else {
      sort.createdAt = sortDirection || DEFAULT_SORT;
      sort._id = 1;
    }

    const defaultPageNumber = Number(pageNumber) || DEFAULT_PAGE_NUMBER;
    const defaultPageSize = Number(pageSize) || DEFAULT_PAGE_SIZE;

    const skip = (defaultPageNumber - 1) * defaultPageSize;

    return { query, sort, skip, pageSize: defaultPageSize, page: defaultPageNumber };
  },

  getUsers: (queryParams: GetUsersQuery) => {
    const { sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm, searchEmailTerm } = queryParams;

    const query: Query = {};
    if (searchLoginTerm && searchEmailTerm) {
      query.$or = [
        { login: { $regex: new RegExp(`.*${searchLoginTerm}.*`, 'i') } },
        { email: { $regex: new RegExp(`.*${searchEmailTerm}.*`, 'i') } },
      ];
    } else {
      if (searchLoginTerm) {
        query.login = { $regex: new RegExp(`.*${searchLoginTerm}.*`, 'i') };
      }
      if (searchEmailTerm) {
        query.email = { $regex: new RegExp(`.*${searchEmailTerm}.*`, 'i') };
      }
    }

    const sort: Filters = {};
    if (sortBy) {
      sort[sortBy] = sortDirection || DEFAULT_SORT;
    } else {
      sort.createdAt = sortDirection || DEFAULT_SORT;
      sort._id = 1;
    }

    const defaultPageNumber = Number(pageNumber) || DEFAULT_PAGE_NUMBER;
    const defaultPageSize = Number(pageSize) || DEFAULT_PAGE_SIZE;

    const skip = (defaultPageNumber - 1) * defaultPageSize;

    return { query, sort, skip, pageSize: defaultPageSize, page: defaultPageNumber };
  },
};

export const hashBuilder = {
  hash: async (input: string, saltRounds = 10) => {
    const salt = await genSalt(saltRounds);
    return await hash(input, salt);
  },
  compare: async (input: string, hashedInput: string) => {
    return await compare(input, hashedInput);
  },
};
