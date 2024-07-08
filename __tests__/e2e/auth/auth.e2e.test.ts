import { HTTP_STATUSES, PATH_URL, RECOVERY_PASS_TOKEN_EXPIRED } from '../../../src/utils/consts';
import { createAuthorizationHeader } from '../../test-helpers';
import { SETTINGS } from '../../../src/utils/settings';
import { testSeeder } from '../../test.seeder';
import { req } from '../../jest.setup';
import { ResultStatus } from '../../../src/types/common/result';
import { authService, jwtService, userRepository, userService } from '../../../src/compositions/composition-root';


describe(`Endpoint (POST) - ${PATH_URL.AUTH.LOGIN}`, () => {
  it(`Should get status ${HTTP_STATUSES.NO_CONTENT_204}`, async () => {
    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login: 'login',
        password: 'password',
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        loginOrEmail: 'login',
        password: 'password',
      })
      .expect(HTTP_STATUSES.OK_200);
  });

  it(`Should get status ${HTTP_STATUSES.UNAUTHORIZED_401}`, async () => {
    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login: 'login',
        password: 'password',
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        loginOrEmail: 'logi',
        password: 'password',
      })
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it(`Should get status ${HTTP_STATUSES.BAD_REQUEST_400}`, async () => {
    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login: 'l',
        password: 'password',
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
  });
});

describe(`Endpoint (POST) - ${PATH_URL.AUTH.REGISTRATION}`, () => {

  it(`Should get status ${HTTP_STATUSES.NO_CONTENT_204}`, async () => {
    await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.REGISTRATION}`)
      .send({
        login: 'login',
        password: 'password',
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);
  });

  it(`Should get status ${HTTP_STATUSES.BAD_REQUEST_400}`, async () => {
    const data = testSeeder.createUserDto();

    await userService.createUser(data);

    const res = await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.REGISTRATION}`)
      .send({
        login: data.login,
        password: data.password,
        email: data.email,
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual({
      errorsMessages: [
        {
          message: 'Email or login already exist',
          field: 'login',
        },
      ],
    });
  });
});

describe(`Endpoint (POST) - ${PATH_URL.AUTH.PASSWORD_RECOVERY}`, () => {
  it(`Should get status ${HTTP_STATUSES.NO_CONTENT_204}`, async () => {
    const data = testSeeder.createUserDto();

    await userService.createUser(data);

    const res = await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.PASSWORD_RECOVERY}`)
      .send({
        email: data.email,
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);


  });

  it(`Should get status ${HTTP_STATUSES.BAD_REQUEST_400}`, async () => {
    const data = testSeeder.createUserDto();

    await userService.createUser(data);

    const res = await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.PASSWORD_RECOVERY}`)
      .send({
        email: 'mail.com',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual({
      errorsMessages: [
        {
          message: 'Email is not correct',
          field: 'email',
        },
      ],
    });
  });
});

describe(`Endpoint (POST) - ${PATH_URL.AUTH.NEW_PASSWORD}`, () => {
  it(`Should get status ${ResultStatus.Success}`, async () => {
    const data = testSeeder.createUserDto();

    await userService.createUser(data);

    const { data: user } = await userRepository.getUserByFields(['login'], data.login);

    const recoveryPassToken = jwtService.generateToken({ userId: user?._id.toString() }, { expiresIn: RECOVERY_PASS_TOKEN_EXPIRED });

    await userRepository.updateUserById(user!._id.toString(), {
      recoveryCode: {
        code: recoveryPassToken,
        isUsed: false,
      },
    });

    const { status } = await authService.newPass('password5', recoveryPassToken);
    expect(status).toBe(ResultStatus.Success);

  });

  it(`Should get status ${ResultStatus.BadRequest} if userId=null `, async () => {
    const data = testSeeder.createUserDto();

    await userService.createUser(data);

    const { data: user } = await userRepository.getUserByFields(['login'], data.login);

    const recoveryPassToken = jwtService.generateToken({ userId: null }, { expiresIn: RECOVERY_PASS_TOKEN_EXPIRED });

    await userRepository.updateUserById(user!._id.toString(), {
      recoveryCode: {
        code: recoveryPassToken,
        isUsed: false,
      },
    });

    const { data: error, status } = await authService.newPass('password5', recoveryPassToken);

    expect(status).toBe(ResultStatus.BadRequest);
    expect(error).toStrictEqual({ errorsMessages: [{ message: 'Recovery Cod not correct', field: 'recoveryCode' }] });
  });

  it(`Should get status ${ResultStatus.BadRequest} if token expired `, async () => {
    const data = testSeeder.createUserDto();

    await userService.createUser(data);

    const { data: user } = await userRepository.getUserByFields(['login'], data.login);

    const recoveryPassToken = jwtService.generateToken({ userId: user!._id.toString() }, { expiresIn: 0 });

    await userRepository.updateUserById(user!._id.toString(), {
      recoveryCode: {
        code: recoveryPassToken,
        isUsed: false,
      },
    });

    const { data: error, status } = await authService.newPass('password5', recoveryPassToken);

    expect(status).toBe(ResultStatus.BadRequest);
    expect(error).toStrictEqual({ errorsMessages: [{ message: 'Recovery Cod not correct', field: 'recoveryCode' }] });
  });

});
