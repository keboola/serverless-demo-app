import * as aws from 'aws-sdk';
import axios from 'axios';
import expect from 'unexpected';

aws.config.setPromisesDependency(Promise);
const lambda = new aws.Lambda({
  region: process.env.REGION,
});

describe('Functional test', () => {
  it('Invoke lambda using aws-sdk', async () => {
    const res = await lambda.invoke({
      FunctionName: `${process.env.SERVICE_NAME}-${process.env.STAGE}-handler`,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
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
      }),
    }).promise();
    expect(res, 'to have key', 'StatusCode');
    expect(res.StatusCode, 'to be', 200);
    expect(res, 'to have key', 'Payload');
    const payload = JSON.parse(res.Payload);
    expect(payload, 'to have key', 'statusCode');
    expect(payload.statusCode, 'to equal', 200);
  });

  it('Invoke lambda through API', async () => {
    const res = await axios({
      method: 'get',
      url: process.env.API_ENDPOINT,
      responseType: 'json',
    });
    expect(res.status, 'to equal', 200);
  });
});
