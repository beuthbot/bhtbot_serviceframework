import express, { Express } from 'express';

import AppConfig from './AppConfig';
import { GatewayAnswer } from './GatewayAnswer';
import GatewayRequest from './GatewayRequest';

export default class Service {
  private config: AppConfig;
  private app: Express;
  private serviceName: string;
  private endpoints = {};

  constructor(serviceName: string, config?: AppConfig) {
    this.serviceName = serviceName;
    this.config = config ?? new AppConfig();
    this.app = this.initExpress();
    this.initDefaultRouting();
  }

  start() {
    this.app.listen(this.config.port, () => {
      console.log(
        `${this.serviceName} listening at http://localhost:${this.config.port}`
      );
    });
  }

  endpoint(
    path: string,
    handler: (
      request: GatewayRequest,
      answer: GatewayAnswer
    ) => Promise<GatewayAnswer>
  ) {
    if (path.length === 0) path = '/';
    if (path[0] !== '/') path = '/' + path;

    this.endpoints[path] = handler;
    this.app.post(path, async (req, res) => {
      const gatewayRequest = this.sanitize(req.body);

      try {
        const expectedHistory = gatewayRequest.answer.history;
        gatewayRequest.answer = await handler(
          gatewayRequest,
          gatewayRequest.answer
        );

        if (!this.isAnswerValid(gatewayRequest.answer, expectedHistory)) {
          throw Error(
            'The answer is invalid. Please make sure that you did pass the correct history object, expected to start with following entries: ' +
              expectedHistory.join(', ')
          );
        }

        res.json(gatewayRequest);
      } catch (ex) {
        gatewayRequest.answer.error =
          'Error in ' + this.serviceName + ': ' + ex.message;
        res.json(gatewayRequest);
      }
    });
  }

  private sanitize(message: GatewayRequest) {
    if (message.answer == undefined) {
      message.answer = new GatewayAnswer();
    }
    const history = message.history !== undefined ? message.history : [];
    message.answer.history = history.concat([this.serviceName]);
    return message;
  }

  private initExpress() {
    const app = express();

    this.config.middleware.forEach((middleware) => {
      app.use(middleware);
    });

    // app.use(express.static(pathToSwaggerUi)) todo

    app.use(this.config.errorHandler);

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
    this.app.get('/', (req, res) => {
      res.send({
        msg: `Hello from ${this.serviceName}!`,
        requestQuery: req.query,
        requestParams: req.params,
        requestBody: req.body,
      });
    });
  }
}
