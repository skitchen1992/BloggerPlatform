export type CreateUserSchema = {
  /**
   * maxLength: 10
   * minLength: 3
   * pattern: ^[a-zA-Z0-9_-]*$
   * must be unique
   */
  login: string;
  /**
   * maxLength: 20
   * minLength: 6
   */
  password: string;
  /**
   * pattern: ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$
   * example: example@example.com
   * must be unique
   */
  email: string;
};
