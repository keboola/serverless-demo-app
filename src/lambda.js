import bluebird from 'bluebird';
import middy from 'middy';
import { install } from 'source-map-support';
import errorLogger from '@keboola/middy-error-logger';

// Webpack does not want to require @babel/runtime required by @keboola/middy-error-logger
// so we enforce it to require manually
import '@babel/runtime/helpers/interopRequireDefault';

install();
process.env.BLUEBIRD_LONG_STACK_TRACES = 1;
global.Promise = bluebird;

const handlerFunction = () => {
  const result = { result: 'ok' };

  return Promise.resolve({ statusCode: 200, body: JSON.stringify(result) });
};

// eslint-disable-next-line
export const handler = middy(handlerFunction)
  .use(errorLogger());
