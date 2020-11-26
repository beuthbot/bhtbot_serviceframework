import { NextHandleFunction } from 'connect';

import {
  cookieMiddleware,
  defaultErrorHandler,
  jsonMiddleware,
  urlEncodeMiddleware,
} from './DefaultMiddleware';

export default class AppConfig {
  port = 3000;
  errorHandler: (err, req, res, next) => void = defaultErrorHandler;
  middleware: NextHandleFunction[] = [
    jsonMiddleware,
    urlEncodeMiddleware,
    cookieMiddleware,
  ];
}
