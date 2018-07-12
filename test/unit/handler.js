const expect = require('unexpected');
const handler = require('../../src/handler');

describe('Test handler', () => {
  it('Handle', () => handler.handler({
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
  }, {}, (err, res) => expect(res, 'to have key', 'statusCode')
    .then(() => expect(res.statusCode, 'to be', 200))
    .then(() => expect(res, 'to have key', 'body'))
    .then(() => expect(res.body, 'to be', '"OK"'))));
});
