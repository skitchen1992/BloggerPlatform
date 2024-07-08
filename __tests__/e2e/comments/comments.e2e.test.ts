import { createAuthorizationHeader, createBearerAuthorizationHeader } from '../../test-helpers';
import { HTTP_STATUSES, PATH_URL } from '../../../src/utils/consts';
import { SETTINGS } from '../../../src/utils/settings';
import { ID } from './datasets';
import { BlogModel } from '../../../src/models/blog';
import { testSeeder } from '../../test.seeder';
import { CommentModel } from '../../../src/models/comment';
import { CommentMapper } from '../../../src/mappers/comment-mapper';
import { PostModel } from '../../../src/models/post';
import { req } from '../../jest.setup';


describe(`Endpoint (GET) - ${PATH_URL.COMMENTS}`, () => {
  it('Should get comment', async () => {
    const commentList = await CommentModel.insertMany(testSeeder.createCommentListDto(1));
    const commentId = commentList[0]._id.toString();

    const res = await req.get(`${PATH_URL.COMMENTS}/${commentId}`).expect(HTTP_STATUSES.OK_200);

    expect(res.body).toEqual(CommentMapper.toCommentDTO(commentList[0]));
  });

  it(`Should get ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    await req.get(`${PATH_URL.COMMENTS}/${ID}`).expect(HTTP_STATUSES.NOT_FOUND_404);
  });
});

describe(`Endpoint (PUT) - ${PATH_URL.COMMENTS}`, () => {

  it('Should update comment', async () => {
    const login = 'testLogin';
    const password = 'string';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const comment = await req
      .post(`${PATH_URL.POSTS}/${postId}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .put(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content content',
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const res = await req.get(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`).expect(HTTP_STATUSES.OK_200);

    expect(res.body).toEqual(
      expect.objectContaining({
        content: 'content content content content',
      }),
    );
  });

  it(`Should get ${HTTP_STATUSES.BAD_REQUEST_400}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const comment = await req
      .post(`${PATH_URL.POSTS}/${postId}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const res = await req
      .put(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'co',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual({
      errorsMessages: [
        {
          field: 'content',
          message: 'Max length 20, min length 300',
        },
      ],
    });
  });

  it(`Should get ${HTTP_STATUSES.UNAUTHORIZED_401}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const comment = await req
      .post(`${PATH_URL.POSTS}/${postId}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .put(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`)
      .send({
        content: 'co content content content',
      })
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it(`Should get ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    await req
      .post(`${PATH_URL.POSTS}/${postId}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .put(`${PATH_URL.COMMENTS}/${ID}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'co content content content',
      })
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it(`Should get ${HTTP_STATUSES.FORBIDDEN_403}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    const login2 = 'testLogin2';
    const password2 = 'string2';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login: login2,
        password: password2,
        email: 'exame@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const token2 = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login2,
      password: password2,
    });

    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const comment = await req
      .post(`${PATH_URL.POSTS}/${postId}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .put(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token2.body.accessToken))
      .send({
        content: 'co content content content',
      })
      .expect(HTTP_STATUSES.FORBIDDEN_403);
  });
});

describe(`Endpoint (DELETE) - ${PATH_URL.COMMENTS}`, () => {

  it('Should delete comment', async () => {
    const login = 'testLogin';
    const password = 'string';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const comment = await req
      .post(`${PATH_URL.POSTS}/${postId}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .put(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content content',
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await req
      .delete(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .expect(HTTP_STATUSES.NO_CONTENT_204);
  });

  it(`Should get ${HTTP_STATUSES.UNAUTHORIZED_401}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const comment = await req
      .post(`${PATH_URL.POSTS}/${postId}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req.delete(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`).expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it(`Should get ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    await req
      .post(`${PATH_URL.POSTS}/${postId}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .delete(`${PATH_URL.COMMENTS}/${ID}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'co content content content',
      })
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it(`Should get ${HTTP_STATUSES.FORBIDDEN_403}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    const login2 = 'testLogin2';
    const password2 = 'string2';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login: login2,
        password: password2,
        email: 'exame@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const token2 = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login2,
      password: password2,
    });

    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const comment = await req
      .post(`${PATH_URL.POSTS}/${postId}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .delete(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token2.body.accessToken))
      .send({
        content: 'co content content content',
      })
      .expect(HTTP_STATUSES.FORBIDDEN_403);
  });
});

