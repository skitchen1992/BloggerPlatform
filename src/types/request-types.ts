import { Request } from 'express';

export type RequestWithBody<B> = Request<{}, {}, B>;

export type RequestWithQuery<Q> = Request<{}, {}, {}, Q>;

export type RequestEmpty = Request<{}, {}, {}, {}>;

export type RequestWithParams<P> = Request<P>;

export type RequestWithQueryAndParams<Q, P> = Request<P, {}, {}, Q>;

export type RequestWithParamsAndBody<B, P> = Request<P, {}, B>;
