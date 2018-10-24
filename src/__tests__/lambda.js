import handler from '../lambda';

describe('Test handler', () => {
  it('Handle', async () => handler({
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
    expect(res).toHaveProperty('statusCode');
    expect(res.statusCode).toBe(200);
    expect(res).toHaveProperty('body');
    expect(res.body).toBe('{"result":"ok"}');
  }));
});
