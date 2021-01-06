import test from 'ava';

import { AppConfig, DefaultMiddleware } from '../index';

import Service from './service';
const testServiceName = 'testService';
const testPorts = [1234, 1235];

test('use config', (t) => {
  testPorts.forEach((port) => {
    const config = new AppConfig().setPort(port);
    const service = new Service(testServiceName, config);
    t.assert(service.config.port === port);
    t.assert(service.config.middleware.length === config.middleware.length);

    service.config.setErrorHandler(null);
    t.assert(service.config.errorHandler === null);
    service.config.setErrorHandler(DefaultMiddleware.defaultErrorHandler);
    t.assert(
      service.config.errorHandler === DefaultMiddleware.defaultErrorHandler
    );

    service.config.setMiddleWare([]);
    t.assert(service.config.middleware.length === 0);

    service.config.addMiddleWare(DefaultMiddleware.cookieMiddleware);
    t.assert(service.config.middleware.length === 1);
    t.assert(
      service.config.middleware[0] === DefaultMiddleware.cookieMiddleware
    );
  });
});
