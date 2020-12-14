import test from 'ava';
import {GatewayAnswer} from "../index";

const historyElems = ['a', 'b', 'c'];
const historyElems2 = historyElems.concat('d');
const testCont = 'Some Test Content';
const testError = 'Some Test Error';

test('answer', (t) => {

  const answer = new GatewayAnswer();
  answer.setCacheable(false);
  t.assert(answer.cacheable === false);
  answer.setCacheable(true);
  t.assert(answer.cacheable === true);

  answer.setHistory(historyElems);
  t.assert(answer.history.length === historyElems.length);
  t.assert(JSON.stringify(answer.history) === JSON.stringify(historyElems));

  answer.addHistory(historyElems2[historyElems2.length-1])
  t.assert(answer.history.length === historyElems2.length);
  t.assert(JSON.stringify(answer.history) === JSON.stringify(historyElems2));

  answer.setHistory(null);
  historyElems.forEach(elem=>answer.addHistory(elem));
  t.assert(answer.history.length === historyElems.length);
  t.assert(JSON.stringify(answer.history) === JSON.stringify(historyElems));

  answer.setContent(testCont);
  t.assert(answer.content === testCont);

  answer.setError(testError);
  t.assert(answer.error === testError);
});

test('builder answer', (t) => {

  const answer = new GatewayAnswer().addHistory(historyElems[0]).setContent(testCont).setCacheable(false).setError(testError);
  t.assert(answer.history.length === 1);
  t.assert(JSON.stringify(answer.history) === JSON.stringify([historyElems[0]]));
  t.assert(answer.cacheable === false);
  t.assert(answer.content === testCont);
  t.assert(answer.error === testError);
});
