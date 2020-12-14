import test from 'ava';

import {Service} from "../index";
const testServiceName = 'testService';
const request = require('supertest');

const testResponseContent = 'Test Response Content';
const testEndpoint = 'testEndpoint';


test('basics', (t) => {
  const service = new Service(testServiceName);
  t.assert(service != null);
  t.assert(service.serviceName, testServiceName);
});

test('endpoint', async (t) => {

  return t.assert(true); //todo

  const service = await new Service(testServiceName).start();

  service.endpoint(testEndpoint, async (_request, answer) => {
    return answer.setContent(testResponseContent);
  });

  let res = await request(service.expressApp).post('/' + testEndpoint);
  t.is(res.status, 200);
  t.is(res.body, null);
  t.is(service.isRunning, true);

  await service.stop();
});

test.serial('server', async (t) => {

  const service = await new Service(testServiceName).start();

  let res = await request(service.expressApp).get('/');
  t.is(res.status, 200);
  t.is(res.body.msg, 'Hello from ' + testServiceName + '!');
  t.is(service.isRunning, true);

  res = await request(service.expressApp).get('/doesnotexist/');
  // .send({email: 'one@example.com'});
  t.is(res.status, 404);

  await t.throwsAsync(await service.start);

  await service.stop();
  t.is(service.isRunning, false);

  await t.throwsAsync(await service.stop);

})
