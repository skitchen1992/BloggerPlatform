import express from 'express';
import cors from 'cors';
import { HTTP_STATUSES, PATH_URL } from './utils/consts';
import { blogsRouter } from './routers/blogs-router';
import { postsRouter } from './routers/posts-router';
import { testingRouter } from './routers/testing-router';
import { usersRouter } from './routers/users-router';
import { authRouter } from './routers/auth-router';
import { commentsRouter } from './routers/coments-router';
import CookieWrapper from './middlewares/cookie-middleware';
import { securityRouter } from './routers/security-router';

export const app = express();

app.use(express.json());
app.use(cors());

const cookieWrapper = new CookieWrapper();
app.use(cookieWrapper.middleware());

app.get(PATH_URL.ROOT, (req, res) => {
  res.status(HTTP_STATUSES.OK_200).json({ version: '1.0' });
});

app.use(PATH_URL.BLOGS, blogsRouter);

app.use(PATH_URL.POSTS, postsRouter);

app.use(PATH_URL.USERS, usersRouter);

app.use(PATH_URL.COMMENTS, commentsRouter);

app.use(PATH_URL.TESTING.ROOT, testingRouter);

app.use(PATH_URL.AUTH.ROOT, authRouter);

app.use(PATH_URL.SECURITY.ROOT, securityRouter);
