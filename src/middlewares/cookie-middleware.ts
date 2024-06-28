import { Request, Response, NextFunction, RequestHandler, CookieOptions } from 'express';
import cookieParser, { CookieParseOptions } from 'cookie-parser';

class CookieWrapper {
  private parser: RequestHandler;

  constructor(secret?: string, options?: CookieParseOptions) {
    this.parser = cookieParser(secret, options);
  }

  public middleware(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      this.parser(req, res, (err) => {
        if (err) {
          return next(err);
        }

        req.getCookie = (name: string) => {
          return req.cookies[name];
        };

        req.setCookie = (
          name: string,
          value: string,
          options: CookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
          }
        ) => {
          res.cookie(name, value, options);
        };

        req.clearCookie = (name: string, options?: CookieOptions) => {
          res.clearCookie(name, options);
        };

        next();
      });
    };
  }
}

export default CookieWrapper;
