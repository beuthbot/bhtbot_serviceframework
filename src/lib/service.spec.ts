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

const testFilePathOGG = 'test/assets/example.ogg';
const testFileNameOGG = 'example.ogg';

const testFilePath = testFilePathOGG;
const testFileName = testFileNameOGG;
const testFileBufferSize = 105243;

const testRequest = new GatewayRequest();
testRequest.history = ['test'];
testRequest.text = 'Test Query';

const testPort = 25522;

test.serial('basics', async (t) => {
  const service = new Service(
    testServiceName,
    new AppConfig().setPort(testPort)
  );
  t.assert(service != null);
  t.assert(service.serviceName, testServiceName);

  t.assert(!service.server, 'Server is undefined');

  await service.start();

  t.assert(service.server, 'Server is defined');
  t.assert(Object.keys(service.endpoints).length === 0, 'No endpoints');

  service.endpoint('', (_) => null);
  t.assert(Object.keys(service.endpoints).length === 1, 'One endpoints');
  t.assert(
    service.endpoints['/'] !== undefined,
    'Empty Endpoint got sanitized'
  );

  await service.stop();
});

test.serial('history error', async (t) => {
  const service = await new Service(
    testServiceName,
    new AppConfig().setPort(testPort)
  ).start();

  service.endpoint(testEndpoint, async (_req, answ) => {
    return answ.setHistory([]).setContent('No History..');
  });

  await request(service.expressApp)
    .post('/' + testEndpoint)
    .set('Accept', 'application/json')
    .send({ message: {} })
    .expect(200)
    .then((response) => {
      t.assert(
        response.body.answer.error &&
          response.body.answer.error.indexOf('history') > 0,
        'History error occured on bad answer'
      );
      return response;
    });

  t.pass();

  await service.stop();
});

test.serial('default AppConfig', async (t) => {
  const service = await new Service(testServiceName);
  t.assert(service.config && service.config.port > 0, 'default config loaded');
});

test.serial('stop before start', async (t) => {
  const service = new Service(testServiceName);
  try {
    await service.stop();
  } catch (e) {
    return t.pass('Stop service before start exception');
  }
  t.fail('No exception on stop without start');
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
    t.is(
      firstFile.data.length,
      testFileBufferSize,
      'Buffer Size of example File matches'
    );
    return answer.setContent(firstFile.name);
  });

  service.fileUploadEndpoint(
    testEndpoint + 'file',
    async (request, _answer) => {
      const fileKeys = Object.keys(request.files);
      const firstFile: UploadedFile = <UploadedFile>request.files[fileKeys[0]];
      t.is(
        firstFile.data.length,
        testFileBufferSize,
        'Buffer Size of example File matches'
      );
      console.log('fileanswerr from buffer', firstFile);
      return FileAnswer.fromBuffer(firstFile.data, firstFile.name);
    }
  );

  await request(service.expressApp)
    .post('/' + testEndpoint)
    .expect(400);

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

  await request(service.expressApp)
    .post('/' + testEndpoint + 'file')
    .set('Accept', 'audio/ogg')
    .attach(testFileName, testFilePath)
    .expect(200);

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
