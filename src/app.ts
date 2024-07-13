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

app.use(PATH_URL.AUTH.ROOT, authRouter);

app.use(PATH_URL.SECURITY.ROOT, securityRouter);

app.use(PATH_URL.TESTING.ROOT, testingRouter);

const a = {
  'pagesCount': 1,
  'page': 1,
  'pageSize': 10,
  'totalCount': 6,
  'items': [{
    'id': '6692472b71eb46e2798037e2',
    'content': 'length_21-weqweqweqwq',
    'commentatorInfo': { 'userId': '6692470471eb46e279803670', 'userLogin': '8044lg' },
    'createdAt': '2024-07-13T09:21:47.000Z',
    'likesInfo': { 'likesCount': 1, 'dislikesCount': 1, 'myStatus': 'Like' },
  }, {
    'id': '6692472a71eb46e2798037d6',
    'content': 'length_21-weqweqweqwq',
    'commentatorInfo': { 'userId': '6692470471eb46e279803670', 'userLogin': '8044lg' },
    'createdAt': '2024-07-13T09:21:46.000Z',
    'likesInfo': { 'likesCount': 1, 'dislikesCount': 1, 'myStatus': 'None' },
  }, {
    'id': '6692472971eb46e2798037ca',
    'content': 'length_21-weqweqweqwq',
    'commentatorInfo': { 'userId': '6692470471eb46e279803670', 'userLogin': '8044lg' },
    'createdAt': '2024-07-13T09:21:45.000Z',
    'likesInfo': { 'likesCount': 4, 'dislikesCount': 0, 'myStatus': 'Like' },
  }, {
    'id': '6692472871eb46e2798037be',
    'content': 'length_21-weqweqweqwq',
    'commentatorInfo': { 'userId': '6692470471eb46e279803670', 'userLogin': '8044lg' },
    'createdAt': '2024-07-13T09:21:44.000Z',
    'likesInfo': { 'likesCount': 0, 'dislikesCount': 1, 'myStatus': 'Dislike' },
  }, {
    'id': '6692472871eb46e2798037b2',
    'content': 'length_21-weqweqweqwq',
    'commentatorInfo': { 'userId': '6692470471eb46e279803670', 'userLogin': '8044lg' },
    'createdAt': '2024-07-13T09:21:44.000Z',
    'likesInfo': { 'likesCount': 2, 'dislikesCount': 0, 'myStatus': 'None' },
  }, {
    'id': '6692472771eb46e2798037a6',
    'content': 'length_21-weqweqweqwq',
    'commentatorInfo': { 'userId': '6692470471eb46e279803670', 'userLogin': '8044lg' },
    'createdAt': '2024-07-13T09:21:43.000Z',
    'likesInfo': { 'likesCount': 2, 'dislikesCount': 0, 'myStatus': 'Like' },
  }],
};
