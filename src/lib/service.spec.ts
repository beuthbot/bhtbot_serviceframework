import test from 'ava';
import { UploadedFile } from 'express-fileupload';
import request from 'supertest';

import { GatewayRequest, Service } from '../index';

const testServiceName = 'testService';

const testResponseContent = 'Test Response Content';
const testEndpoint = 'testEndpoint';

const testFilePath = 'src/lib/service.ts';
const testFileName = 'service.ts';

const testRequest = new GatewayRequest();
testRequest.history = ['test'];
testRequest.text = 'Test Query';

test('basics', (t) => {
  const service = new Service(testServiceName);
  t.assert(service != null);
  t.assert(service.serviceName, testServiceName);
});

test.serial('endpoint', async (t) => {
  const service = await new Service(testServiceName).start();

  service.endpoint(testEndpoint, async (_request, answer) => {
    return answer.setContent(testResponseContent);
  });

  await request(service.expressApp)
    .post('/' + testEndpoint)
    .set('Accept', 'application/json')
    .send({ message: testRequest })
    .expect(200)
    .expect('Content-Type', /json/)
    .then((response) => {
      t.deepEqual(
        response.body.answer.history,
        [].concat(testRequest.history).concat([testServiceName])
      );
      t.is(response.body.text, testRequest.text);
      t.is(response.body.answer.content, testResponseContent);
      return response;
    });

  t.is(service.isRunning, true);

  await service.stop();
});

test.serial('file_endpoint', async (t) => {
  const service = await new Service(testServiceName).start();

  service.fileUploadEndpoint(testEndpoint, async (request, answer) => {
    const fileKeys = Object.keys(request.files);
    const firstFile: UploadedFile = <UploadedFile>request.files[fileKeys[0]];
    return answer.setContent(firstFile.name);
  });

  await request(service.expressApp)
    .post('/' + testEndpoint)
    .set('Accept', 'application/json')
    .attach(testFileName, testFilePath)
    .expect(200)
    .expect('Content-Type', /json/)
    .then((response) => {
      t.deepEqual(response.body.answer.history, ['file_upload']);
      t.is(response.body.answer.content, testFileName);
      return response;
    });

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
});
