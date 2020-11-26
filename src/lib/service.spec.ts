import test from 'ava';

import Service from './service';
const testServiceName = 'testService';
const service = new Service(testServiceName);

test('test', (t) => {
  t.assert(true, 'Example test');
  t.assert(service != null);
});
