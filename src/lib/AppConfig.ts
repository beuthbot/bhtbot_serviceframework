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
  setPort(port:number){
    this.port = port;
    return this;
  }
  setErrorHandler(func: (err, req, res, next) => void){
    this.errorHandler = func;
    return this;
  }
  setMiddleWare(middleware: NextHandleFunction[]){
    this.middleware = middleware;
    return this;
  }
  addMiddleWare(middleware: NextHandleFunction){
    this.middleware.push(middleware);
    return this;
  }
}
