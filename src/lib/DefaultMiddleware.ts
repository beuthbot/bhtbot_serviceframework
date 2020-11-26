import { NextHandleFunction } from 'connect';
import cookieParser from 'cookie-parser';
import express from 'express';

export function defaultErrorHandler(err, _req, res, _next) {
  res.status(500);
  res.render('error', { error: err });
}

export const jsonMiddleware: NextHandleFunction = express.json();

export const urlEncodeMiddleware: NextHandleFunction = express.urlencoded({
  extended: true,
});

export const cookieMiddleware: NextHandleFunction = cookieParser();
