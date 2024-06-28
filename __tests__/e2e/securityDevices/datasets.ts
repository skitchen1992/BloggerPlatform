import { getCurrentDate } from '../../../src/utils/dates/dates';

export const ID = '1A2B3C4D5E6F7A8B9C0D1E2F';

export const dataSetNewPost = {
  title: 'Title',
  shortDescription: 'ShortDescription',
  content: 'Content',
  blogId: '1',
  createdAt: getCurrentDate(),
};

export const dataSetNewPost0 = {
  title: 'Title',
  shortDescription: 'ShortDescription',
  content: 'Content',
  blogId: '1',
};

export const dataSetNewBlog = {
  name: 'Test',
  description: 'Test description',
  websiteUrl: 'https://string.com',
};

export const dataSetNewPost1 = {
  title:
    'Title very long string in the world very long string in the world Title very long string in the world very long string in the world',
  shortDescription: 'ShortDescription',
  content: 'Content',
  blogId: '1',
};

export const errorDataSet1 = {
  errorsMessages: [
    {
      message: 'Max length 30',
      field: 'title',
    },
  ],
};

export const dataSetNewPost2 = {
  title: null,
  shortDescription: 'ShortDescription',
  content: 'Content',
  blogId: '1',
};

export const errorDataSet2 = {
  errorsMessages: [
    {
      message: 'Not a string',
      field: 'title',
    },
  ],
};

export const dataSetNewPost3 = {
  shortDescription: 'ShortDescription',
  content: 'Content',
  blogId: '1',
};

export const errorDataSet3 = {
  errorsMessages: [
    {
      message: 'Is required',
      field: 'title',
    },
  ],
};

export const dataSetNewPost4 = {
  title: 'Title',
  shortDescription:
    'Title very long string in the world very long string in the world Title very long string in the world very long string in the world',
  content: 'Content',
  blogId: '1',
};

export const errorDataSet4 = {
  errorsMessages: [
    {
      message: 'Max length 100',
      field: 'shortDescription',
    },
  ],
};

export const dataSetNewPost5 = {
  title: 'Title',
  shortDescription: null,
  content: 'Content',
  blogId: '1',
};

export const errorDataSet5 = {
  errorsMessages: [
    {
      message: 'Not a string',
      field: 'shortDescription',
    },
  ],
};

export const dataSetNewPost6 = {
  title: 'Title',
  content: 'Content',
  blogId: '1',
};

export const errorDataSet6 = {
  errorsMessages: [
    {
      message: 'Is required',
      field: 'shortDescription',
    },
  ],
};

export const dataSetNewPost7 = {
  title: 'Title',
  shortDescription: 'Short Description',
  content:
    'Title very long string in the world very long string in the world Title very long string in the world very long string in the world, Title very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the world',
  blogId: '1',
};

export const errorDataSet7 = {
  errorsMessages: [
    {
      message: 'Max length 1000',
      field: 'content',
    },
  ],
};

export const dataSetNewPost8 = {
  title: 'Title',
  shortDescription: 'Short Description',
  content: null,
  blogId: '1',
};

export const errorDataSet8 = {
  errorsMessages: [
    {
      message: 'Not a string',
      field: 'content',
    },
  ],
};

export const dataSetNewPost9 = {
  title: 'Title',
  shortDescription: 'Short Description',
  blogId: '1',
};

export const errorDataSet9 = {
  errorsMessages: [
    {
      message: 'Is required',
      field: 'content',
    },
  ],
};

export const dataSetNewPost10 = {
  title: 'Title',
  shortDescription: 'Short Description',
  content: 'Content',
  blogId: '1',
  test: 1,
};

export const errorDataSet10 = {
  errorsMessages: [
    {
      message: 'Too many fields specified',
      field: 'unknown_fields',
    },
  ],
};

export const dataSetUpdatePost = {
  title: 'Title',
  shortDescription: 'Short Description',
  content: 'Content',
  blogId: '1',
};

export const errorDataSet11 = {
  errorsMessages: [
    {
      message: 'Too many fields specified',
      field: 'unknown_fields',
    },
  ],
};
