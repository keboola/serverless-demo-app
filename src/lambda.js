import middy from 'middy';
import errorLogger from '@keboola/middy-error-logger';

const handlerFunction = () => {
  const result = { result: 'ok' };
  return Promise.resolve({ statusCode: 200, body: JSON.stringify(result) });
};

// eslint-disable-next-line
export const handler = middy(handlerFunction)
  .use(errorLogger());
