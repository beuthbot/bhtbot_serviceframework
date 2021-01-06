import test from 'ava';

import { DefaultMiddleware } from '../index';

const testErrMsg = 'Test Error....';

const testRes = {
  errorNumber: undefined,
  errorMessage: undefined,
  errorType: undefined,
  status(nr: number) {
    this.errorNumber = nr;
  },
  render(type: string, errObj: { error: string }) {
    this.errorMessage = errObj.error;
    this.errorType = type;
  },
};

test('errorhandler', (t) => {
  DefaultMiddleware.defaultErrorHandler(testErrMsg, null, testRes, null);

  t.assert(testRes.errorNumber === 500);
  t.assert(testRes.errorMessage === testErrMsg);
  t.assert(testRes.errorType === 'error');
});
