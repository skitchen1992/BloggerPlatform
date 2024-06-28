import { getPageCount, isValidObjectId, searchQueryBuilder } from '../../src/utils/helpers';
import { ObjectId } from 'mongodb';
import { getCurrentDate } from '../../src/utils/dates/dates';

test('getPageCount calculates correct page count', () => {
  expect(getPageCount(100, 10)).toBe(10);
  expect(getPageCount(101, 10)).toBe(11);
  expect(getPageCount(0, 10)).toBe(0);
  expect(getPageCount(5, 5)).toBe(1);
});

test('getCurrentDate returns a valid ISO date string', () => {
  const currentDate = getCurrentDate();
  expect(new Date(currentDate).toISOString()).toBe(currentDate);
});

test('isValidObjectId correctly validates ObjectId', () => {
  const validId = new ObjectId().toHexString();
  const invalidId = 'invalidObjectId';
  expect(isValidObjectId(validId)).toBe(true);
  expect(isValidObjectId(invalidId)).toBe(false);
});

describe('searchQueryBuilder', () => {
  test('getBlogs builds correct query object', () => {
    const queryParams = {
      searchNameTerm: 'test',
      sortBy: 'name',
      sortDirection: 'desc',
      pageNumber: '2',
      pageSize: '5',
    };

    const expectedResult = {
      query: { name: { $regex: new RegExp(`.*test.*`, 'i') } },
      sort: { name: 'desc' },
      skip: 5,
      pageSize: 5,
      page: 2,
    };
    //@ts-ignore
    expect(searchQueryBuilder.getBlogs(queryParams)).toEqual(expectedResult);
  });

  test('getPosts builds correct query object', () => {
    const queryParams = {
      sortBy: 'date',
      sortDirection: 'asc',
      pageNumber: '3',
      pageSize: '10',
    };
    const params = { blogId: '12345' };

    const expectedResult = {
      query: { blogId: '12345' },
      sort: { date: 'asc' },
      skip: 20,
      pageSize: 10,
      page: 3,
    };
    //@ts-ignore
    expect(searchQueryBuilder.getPosts(queryParams, params)).toEqual(expectedResult);
  });

  test('getUsers builds correct query object', () => {
    const queryParams = {
      sortBy: 'login',
      sortDirection: 'desc',
      pageNumber: '1',
      pageSize: '20',
      searchLoginTerm: 'john',
      searchEmailTerm: 'doe',
    };

    const expectedResult = {
      query: {
        $or: [{ login: { $regex: new RegExp(`.*john.*`, 'i') } }, { email: { $regex: new RegExp(`.*doe.*`, 'i') } }],
      },
      sort: { login: 'desc' },
      skip: 0,
      pageSize: 20,
      page: 1,
    };
    //@ts-ignore
    expect(searchQueryBuilder.getUsers(queryParams)).toEqual(expectedResult);
  });
});
