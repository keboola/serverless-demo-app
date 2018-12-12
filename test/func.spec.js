/**
 * @jest-environment node
 */

import * as aws from 'aws-sdk';
import axios from 'axios';

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
    expect(res).toHaveProperty('StatusCode');
    expect(res.StatusCode).toBe(200);
    expect(res).toHaveProperty('Payload');
    const payload = JSON.parse(res.Payload);
    expect(payload).toHaveProperty('statusCode');
    expect(payload.statusCode).toBe(200);
  });

  it('Invoke lambda through API', async () => {
    const res = await axios({
      method: 'get',
      url: process.env.API_ENDPOINT,
      responseType: 'json',
    });
    expect(res.status).toBe(200);
  });
});
