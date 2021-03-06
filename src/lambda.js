import errorLogger from '@keboola/middy-error-logger';
import middy from 'middy';
import { cors } from 'middy/middlewares';
import { install } from 'source-map-support';

// Webpack does not want to require @babel/runtime required by @keboola/middy-error-logger
// so we enforce it to require manually
import '@babel/runtime/helpers/interopRequireDefault';

install();

const handlerFunction = () => {
  const result = { result: 'ok' };

  return Promise.resolve({ statusCode: 200, body: JSON.stringify(result) });
};

// eslint-disable-next-line
export const handler = middy(handlerFunction)
  .use(errorLogger())
  .use(cors());
