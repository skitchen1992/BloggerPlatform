import { GetUserSchema } from '../../Veiw';
import { CookieOptions } from 'express';

declare global {
  namespace Express {
    interface Locals {
      user?: GetUserSchema;
    }
    interface Request {
      getCookie(name: string): string | undefined;
      setCookie(name: string, value: string, options?: CookieOptions): void;
      clearCookie(name: string, options?: CookieOptions): void;
    }
  }
}
