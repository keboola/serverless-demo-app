import expect from 'unexpected';
import * as lambda from '../../src/lambda';

describe('Test handler', () => {
  it('Handle', async () => lambda.handler({
    resource: '/',
    path: '/',
    httpMethod: 'GET',
    headers: {},
    body: null,
    pathParameters: null,
    queryStringParameters: null,
    requestContext: {
      requestId: '123',
    },
  }, {}, (err, res) => {
    expect(res, 'to have key', 'statusCode');
    expect(res.statusCode, 'to equal', 200);
    expect(res, 'to have key', 'body');
    expect(res.body, 'to equal', '{"result":"ok"}');
  }));
});
