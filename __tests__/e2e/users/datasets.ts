export const dataSetNewUser1 = {
  login: 'T',
  password: 'ShortDescription',
  email: 'test@gmail.com',
};

export const errorDataSet1 = {
  errorsMessages: [
    {
      message: 'Max length 10',
      field: 'login',
    },
  ],
};

export const dataSetNewUser2 = {
  login: 'Login',
  password: 'ShortDescriptionsdfsdfsdfsdfsdfsdfsdfsdfsdfsd',
  email: 'test@gmail.com',
};

export const errorDataSet2 = {
  errorsMessages: [
    {
      message: 'Max length 20',
      field: 'password',
    },
  ],
};

export const dataSetNewUser3 = {
  login: 'Login',
  password: 'ShortDescrip',
  email: 'testmailcom',
};

export const errorDataSet3 = {
  errorsMessages: [
    {
      message: 'Email is not correct',
      field: 'email',
    },
  ],
};
