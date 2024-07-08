import { config } from 'dotenv';

config(); // добавление переменных из файла .env в process.env

export const SETTINGS = {
  PORT: process.env.PORT,
  ADMIN_AUTH_USERNAME: process.env.ADMIN_AUTH_USERNAME,
  ADMIN_AUTH_PASSWORD: process.env.ADMIN_AUTH_PASSWORD,
  MONGO_DB_URL: process.env.MONGO_DB_URL,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  DB: {
    NAME: {
      PORTAL: 'bloggerPlatform',
    },
    COLLECTION: {
      BLOGS: 'blogs',
      POSTS: 'posts',
      USERS: 'users',
      COMMENTS: 'comments',
      DEVICE_AUTH_SESSIONS: 'deviceAuthSessions',
      VISITS: 'visits',
      LIKES: 'likes',
    },
  },
};
