import { SETTINGS } from './utils/settings';
import { app } from './app';
import { db } from './db/connection';


const startApp = async () => {

  if (await db.connect(SETTINGS.MONGO_DB_URL)) {
    app.set('trust proxy', true);

    app.listen(SETTINGS.PORT, () => {
      console.log(`App listening on port ${SETTINGS.PORT}`);
    });
  } else {
    console.log('Failed to connect to database');
    process.exit(1);
  }
};

startApp();

const b = {
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
    'id': '6692472871eb46e2798037b2',
    'content': 'length_21-weqweqweqwq',
    'commentatorInfo': { 'userId': '6692470471eb46e279803670', 'userLogin': '8044lg' },
    'createdAt': '2024-07-13T09:21:44.000Z',
    'likesInfo': { 'likesCount': 2, 'dislikesCount': 0, 'myStatus': 'None' },
  }, {
    'id': '6692472871eb46e2798037be',
    'content': 'length_21-weqweqweqwq',
    'commentatorInfo': { 'userId': '6692470471eb46e279803670', 'userLogin': '8044lg' },
    'createdAt': '2024-07-13T09:21:44.000Z',
    'likesInfo': { 'likesCount': 0, 'dislikesCount': 1, 'myStatus': 'Dislike' },
  }, {
    'id': '6692472771eb46e2798037a6',
    'content': 'length_21-weqweqweqwq',
    'commentatorInfo': { 'userId': '6692470471eb46e279803670', 'userLogin': '8044lg' },
    'createdAt': '2024-07-13T09:21:43.000Z',
    'likesInfo': { 'likesCount': 2, 'dislikesCount': 0, 'myStatus': 'Like' },
  }],
};
