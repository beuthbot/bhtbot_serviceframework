import fs from 'fs';

import test from 'ava';
import { UploadedFile } from 'express-fileupload';
import request from 'supertest';

import { GatewayRequest, Service } from '../index';

import AppConfig from './AppConfig';
import FileAnswer from './FileAnswer';

const testServiceName = 'testService';

const testResponseContent = 'Test Response Content';
const testEndpoint = 'testEndpoint';

const testFilePath = 'src/lib/service.ts';
const testFileName = 'service.ts';

const testFilePathOGG = 'test/assets/example.ogg';
const testFileNameOGG = 'example.ogg';

const testRequest = new GatewayRequest();
testRequest.history = ['test'];
testRequest.text = 'Test Query';

const testPort = 25522;

test('basics', (t) => {
  const service = new Service(testServiceName);
  t.assert(service != null);
  t.assert(service.serviceName, testServiceName);
});

test.serial('download_endpoint', async (t) => {
  const service = await new Service(
    testServiceName,
    new AppConfig().setPort(testPort)
  ).start();
  const fromBuffer = '_from_buffer';

  service.endpoint(testEndpoint, async (_request, _answer) => {
    return FileAnswer.fromPath(testFilePathOGG);
  });

  service.endpoint(testEndpoint + fromBuffer, async (_request, _answer) => {
    return FileAnswer.fromBuffer(
      fs.readFileSync(testFilePathOGG),
      testFileNameOGG
    );
  });

  // test with filepath
  await request(service.expressApp)
    .post('/' + testEndpoint)
    .set('Accept', 'application/json')
    .send({ message: {} })
    .expect(200)
    .expect('Content-Type', 'audio/ogg');

  // test with file from memory buffer
  await request(service.expressApp)
    .post('/' + testEndpoint + fromBuffer)
    .set('Accept', 'application/json')
    .send({ message: {} })
    .expect(200)
    .expect('Content-Type', 'audio/ogg')
    .then((response) => {
      // console.log(response)
      return response;
    });

  t.is(service.isRunning, true);

  await service.stop();
});

test.serial('endpoint', async (t) => {
  const service = await new Service(
    testServiceName,
    new AppConfig().setPort(testPort)
  ).start();

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
  const service = await new Service(
    testServiceName,
    new AppConfig().setPort(testPort)
  ).start();

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
  const service = await new Service(
    testServiceName,
    new AppConfig().setPort(testPort)
  ).start();

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
