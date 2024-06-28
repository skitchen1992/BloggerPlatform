import { getCurrentDate } from '../../../src/utils/dates/dates';

export const ID = '1A2B3C4D5E6F7A8B9C0D1E2F';

export const dataSetNewPost = {
  title: 'Title',
  shortDescription: 'ShortDescription',
  content: 'Content',
  blogId: '1',
  createdAt: getCurrentDate(),
};

export const dataSetNewBlog = {
  name: 'Test',
  description: 'Test description',
  websiteUrl: 'https://string.com',
};
