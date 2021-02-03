import * as http from 'http';

import express, { Express } from 'express';

import AppConfig from './AppConfig';
import FileAnswer from './FileAnswer';
import GatewayAnswer from './GatewayAnswer';
import GatewayFileRequest from './GatewayFileRequest';
import GatewayRequest from './GatewayRequest';

export default class Service {
  private readonly _config: AppConfig;
  private readonly _expressApp: Express;
  private readonly _serviceName: string;
  private _endpoints = {};
  private _server: http.Server;

  constructor(serviceName: string, config?: AppConfig) {
    this._serviceName = serviceName;
    this._config = config ?? new AppConfig();
    this._expressApp = this.initExpress();
    this.initDefaultRouting();
  }

  async start() {
    return await new Promise<Service>((resolve, reject) => {
      try {
        this._server = this._expressApp.listen(this._config.port, () => {
          console.log(
            `${this._serviceName} listening at http://localhost:${this._config.port}`
          );
          resolve(this);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async stop() {
    return await new Promise<Service>((resolve, reject) => {
      try {
        if (this._server) {
          this._server.close((_res) => {
            this._server = undefined;
            console.log(`${this._serviceName} stopped`);
            resolve(this);
          });
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  fileUploadEndpoint(
    path: string,
    handler: (
      request: GatewayFileRequest,
      answer: GatewayAnswer
    ) => Promise<GatewayAnswer | FileAnswer>
  ) {
    path = this.sanitizePath(path);

    this._endpoints[path] = { handler, isFileUpload: true };
    this._expressApp.post(path, async (req, res) => {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }

      const fileRequest = new GatewayFileRequest(req.files);
      let answer: GatewayAnswer | FileAnswer = new GatewayAnswer();

      if (answer instanceof FileAnswer) {
        return res.status(200).download(answer.filePath, answer.fileName);
      }

      answer.setHistory(['file_upload']);
      answer = await handler(fileRequest, answer);

      return await res.json({ answer });
    });
  }

  endpoint(
    path: string,
    handler: (
      request: GatewayRequest,
      answer: GatewayAnswer
    ) => Promise<GatewayAnswer | FileAnswer>
  ) {
    path = this.sanitizePath(path);

    this._endpoints[path] = { handler, isFileUpload: false };
    this._expressApp.post(path, async (req, res) => {
      const gatewayRequest = this.sanitize(req.body.message);

      try {
        const expectedHistory = gatewayRequest.answer.history;
        const answer = await handler(gatewayRequest, gatewayRequest.answer);

        if (answer instanceof FileAnswer) {
          return res.status(200).download(answer.filePath, answer.fileName);
        }

        gatewayRequest.answer = answer;

        if (!this.isAnswerValid(gatewayRequest.answer, expectedHistory)) {
          throw Error(
            'The answer is invalid. Please make sure that you did pass the correct history object, expected to start with following entries: ' +
              expectedHistory.join(', ')
          );
        }

        await res.json(gatewayRequest);
      } catch (ex) {
        gatewayRequest.answer.error =
          'Error in ' + this._serviceName + ': ' + ex.message;
        gatewayRequest.answer.setCacheable(false);
        await res.json(gatewayRequest);
      }
    });
  }

  private sanitize(message: GatewayRequest) {
    if (message.answer == undefined) {
      message.answer = new GatewayAnswer();
    }
    const history = message.history !== undefined ? message.history : [];
    message.answer.history = history.concat([this._serviceName]);
    return message;
  }

  private initExpress() {
    const app = express();

    this._config.middleware.forEach((middleware) => {
      app.use(middleware);
    });

    // app.use(express.static(pathToSwaggerUi)) todo

    app.use(this._config.errorHandler);

    return app;
  }

  private isAnswerValid(answer: GatewayAnswer, expectedHistory: string[]) {
    return (
      answer &&
      answer.history &&
      answer.history.length >= expectedHistory.length &&
      answer.history.reduce(
        (prev, curr, idx) => prev && curr === expectedHistory[idx],
        true
      )
    );
  }

  private initDefaultRouting() {
    this._expressApp.get('/', (req, res) => {
      res.send({
        msg: `Hello from ${this._serviceName}!`,
        requestQuery: req.query,
        requestParams: req.params,
        requestBody: req.body,
      });
    });
  }

  get config(): AppConfig {
    return this._config;
  }

  get serviceName(): string {
    return this._serviceName;
  }

  get expressApp(): Express {
    return this._expressApp;
  }

  get isRunning() {
    return !!this._server;
  }

  get server(): http.Server {
    return this._server;
  }

  get endpoints() {
    return this._endpoints;
  }

  private sanitizePath(path: string) {
    if (path.length === 0) path = '/';
    if (path[0] !== '/') path = '/' + path;
    return path;
  }
}
