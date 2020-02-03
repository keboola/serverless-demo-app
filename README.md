# Demo Serverless App

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![Build Status](https://travis-ci.org/keboola/serverless-demo-app.svg)](https://travis-ci.org/keboola/serverless-demo-app)

A sample serverless app for Keboola infrastructure


## Architecture

- Our serverless apps use [Serverless Framework](https://serverless.com/framework/docs/providers/aws/guide/intro/).
- AWS Lambda understands only LTS versions Node (currently v12). Therefore we use Babel to compile source code during deployment which allows us to use new language features. 
- The source code is bundled by Webpack during deployment. 
    - There is `source-map` support for translation of error stack traces to original sources. 

### Code style

- Compliance with enclosed ESLint rules based on `@keboola/eslint-config-node` is expected.

### Files structure
- `src` - source code of the functions
- `test` - app and functional tests
- `.babelrc` - definition for Babel compiler
- `.env` - definition of env vars
- `.eslintrc.json` - ESlint rules
- `.travis.yml` - definition for Travis CI
- `cf-stack.json` - CloudFormation template for custom AWS resources
- `docker-compose.yml` - Docker Compose services for local development
- `Dockerfile` - Docker image setup
- `package.json` - npm dependencies
- `serverless.yml` - service definition for Serverless framework
- `webpack.config.js` - definition for Webpack

### npm Dependencies
- [`@keboola/middy-error-logger`](https://github.com/keboola/middy-error-logger) - a middleware for Middy creating unified response for error states
- `@babel/core`, `@babel/preset-env`, `babel-core`, `babel-eslint`, `babel-jest` - requirements for ES6 translation
- [`lodash`](https://lodash.com/) - utility library
- `source-map-support` - a requirement for translation of error stacks from Webpack compiled code to original source code
- `aws-sdk` - official AWS SDK (it is in dev dependencies because Lambda runtime in AWS already has it included)
- [`axios`](https://github.com/axios/axios) - a HTTP client for functional testing of API Gateway
- `eslint`, `babel-eslint`, `@keboola/eslint-config-node` - requirements for ESLint
- `mocha` - testing framework
- `serverless` - app framework
- `serverless-webpack`, `webpack`, `webpack-node-externals` - requirements for Webpack

### Lambda handler

The basic structure of `src/lambda.js` file looks like this:

```js
import middy from 'middy';
import { install } from 'source-map-support';
import errorLogger from '@keboola/middy-error-logger';

install();

const handlerFunction = () => {
  const result = { result: 'ok' };
  return Promise.resolve({ statusCode: 200, body: JSON.stringify(result) });
};

// eslint-disable-next-line
export const handler = middy(handlerFunction)
  .use(errorLogger());
```

- The code is compressed using Webpack so we need to install source maps support (to get line numbers of original source files in stack traces).
- We use Middy.js as a middleware engine with [our error logger](https://github.com/keboola/middy-error-logger) as its middleware.
- It expects using of [http-errors](https://www.npmjs.com/package/http-errors) for client errors and handles the output to client accordingly.
- This file should contain necessary minimum of code to simplify testing process. You can add some routing here, see e.g. [keboola/gooddata-provisioning](https://github.com/keboola/gooddata-provisioning/blob/master/src/api.js).


## Stages

The app uses three instances or stages.
- `dev` is for local development and each developer can has his own one
- `test` is for continuous integration using Travis CI
- `prod` is for production

[docker-compose.yml](https://github.com/keboola/serverless-demo-app/blob/master/docker-compose.yml) has shortcuts to deploy and test the `dev` stage. The others are configured in [.travis.yml](https://github.com/keboola/serverless-demo-app/blob/master/.travis.yml). Each service uses different set of env vars (prefixed by `DEV_`, `CI_` or `PROD_`).


## Environment variables

Locally, it is convenient to save the env vars to `.env` file. Each stage has its own set of env vars under common prefix, see [.env.template](https://github.com/keboola/serverless-demo-app/blob/master/src/.en.template). The variables are:

- `DEPLOY_AWS_ACCESS_KEY_ID` - IAM credentials of the user used for service deployment
- `DEPLOY_AWS_SECRET_ACCESS_KEY` - IAM credentials of the user used for service deployment
- `KEBOOLA_STACK_TAG` - AWS tag of created resources, it should be the same for all instances (e.g. `serverless-demo-app`)
- `REGION` - AWS region of deployed service
- `SERVICE_NAME` - used for names of AWS resources, it should be unique (e.g. `jakub-serverless-demo-app`)

Variables used for testing:

- `TEST_AWS_ACCESS_KEY_ID` - IAM credentials of user used for functional testing
- `TEST_AWS_SECRET_ACCESS_KEY` - IAM credentials of user used for functional testing
- `TEST_API_ENDPOINT` - http endpoint of created API Gateway (e.g. `https://l217h7oa23.execute-api.eu-west-1.amazonaws.com/dev`)

You will want to add other variables if your functions use other resources.

## CloudFormation stack

There is CF template [cf-stack.json](https://github.com/keboola/serverless-demo-app/blob/master/cf-stack.json) which already contains some resources.
- `ServerlessDeploymentPolicy` - IAM policy with set of permissions required for a user performing deployment of the service
- `ServerlessDeploymentGroup` - IAM group which should be attached to a user performing deployment of the service
- `FunctionalTestPolicy` - Template of IAM policy which should be used for functional tests
- `FunctionalTestGroup` - IAM group which should be attached to a user running functional tests
- `ServerlessDeploymentBucket` - S3 bucket for service deployment

Add other resources if your app needs them. 

## Logging

Serverless plugins `@keboola/middy-error-logger` handle formatting of CloudWatch logs to Papertrail. Service name is used for log's `hostname` and stage is used for log's `program`. AWS Request id is added to the log so that you can use it for further debug in CloudWatch logs if needed.

The logs look like:

```json
{
    "statusCode": 200,
    "event": {
        "resource": "/auth/login",    
        "httpMethod": "POST",
        "queryStringParameters": null,
        "body": null
    },
    "context": {
        "sourceIp": "214.178.123.91",
        "userAgent": "Paw/3.1.7 (Macintosh; OS X/10.14.0) GCDHTTPRequest"
      },
    "awsRequestId": "a32d32a5-1228-11e8-91cc-89975b126b44"
}
```

Unhandled exceptions or rejected promises are logged with `"statusCode":500` so you can use this phrase to create Papertrail search with alarm. Example:

```json
{
  "message": "_this.storage.authx is not a function",
  "statusCode": 500,
  "stack": [
    "TypeError: _this.storage.authx is not a function",
    "    at /var/task/src/lambda/webpack:/src/app/Visualize.js:18:32"
  ],
  "event": {
    "resource": "/",
    "httpMethod": "GET",
    "queryStringParameters": null,
    "body": null
  },
  "context": {
    "sourceIp": "214.178.123.91",
    "userAgent": "Paw/3.1.7 (Macintosh; OS X/10.14.0) GCDHTTPRequest"
  },
  "awsRequestId": "ab022f5a-d3ad-11e8-89f6-89a425b4ca0a"
}
```

## App tests

App tests can run whole handler and check its response, see [test/unit/lambda.js](https://github.com/keboola/serverless-demo-app/blob/master/test/unit/lambda.js).

## Functional tests

Functional tests should invoke deployed functions externally. Either by calling API Gateway using a HTTP client or by invoking lambda function using AWS SDK. You will find both examples in [test/func/func.js](https://github.com/keboola/serverless-demo-app/blob/master/test/func/func.js).

If your handler use other AWS resources, you should check their state in your test. Add permissions to the resources to `FunctionalTestPolicy` in [cf-stack.json](https://github.com/keboola/serverless-demo-app/blob/master/cf-stack.json).

## Installation

1. Download git repository: `git clone git@github.com:keboola/serverless-demo-app.git`
2. Create a stack [cf-stack.json](https://github.com/keboola/serverless-demo-app/blob/master/cf-stack.json) with IAM policies and user groups for deployment and functional testing. You will need to fill parameters:
    - `ServiceName` - should be the same as `SERVICE_NAME` env var (e.g. `dev-serverless-demo-app`)
    - `KeboolaStack` - should be the same as `KEBOOLA_STACK_TAG` env var (e.g. `serverless-demo-app`)
    - `Stage` - one of: `dev`, `test`, `prod` (again, should be the same as `STAGE` env var)
3. Create an IAM user for deployment (e.g. `serverless-demo-app-deploy`) and assign it to the group created in previous step. Create AWS credentials.
4. Create an IAM user for testing (e.g. `serverless-demo-app-testing`) and assign it to the group created in previous step. Create AWS credentials.
5. Create `.env` file from template [.env.template](https://github.com/keboola/serverless-demo-app/blob/master/.env.template)
6. Run `docker-compose run --rm dev-deploy`

## CI and deployment

CI is configured on Travis, see <https://travis-ci.org/keboola/serverless-demo-app>. Deployment to production is run automatically after releasing a version on GitHub.

1. Create two sets of env variables with `CI_` and `PROD_` prefixes in Travis settings.
2. Create an IAM user for pushing to ECR repository (e.g. `serverless-demo-app-ecr`) with `AmazonEC2ContainerRegistryFullAccess` policy attached. Save its credentials to Travis env vars as `ECR_AWS_ACCESS_KEY_ID` and `ECR_AWS_SECRET_ACCESS_KEY`.
3. Create an ECS repository (e.g. `keboola/serverless-demo-app`) and add a Lifecycle policy to expire images with tags prefixed by `stage-` when their count exceeds 10.

## Adding custom resources

- You can add custom resources preferably by adding them to [cf-stack.json](https://github.com/keboola/serverless-demo-app/blob/master/cf-stack.json). 
- You will have to add permissions to the IAM role used for running lambda functions. Look to `appLambdaRole` in `resources` section of [serverless.yml](https://github.com/keboola/serverless-demo-app/blob/master/serverless.yml) file.
- You should also add permissions to the policy used for functional testing (`FunctionalTestPolicy` in [cf-stack.json](https://github.com/keboola/serverless-demo-app/blob/master/cf-stack.json)) and check state of the resources in the tests. 

### Unit testing of code using custom resources

You can mock some AWS services using [LocalStack](https://localstack.cloud/). In this case add the service to `docker-compose.yml`, then link it to the test service and fill env vars like:

```yaml
  localstack:
    image: localstack/localstack
    ports:
      - "4569:4569"
      - "4572:4572"
    environment:
      - "SERVICES=s3,dynamodb"

  dev-test-app:
    ...
    links:
      - localstack
    environment:
      - "AWS_ACCESS_KEY_ID=accessKey"
      - "AWS_SECRET_ACCESS_KEY=secretKey"
      - "DYNAMO_ENDPOINT=http://localstack:4569"
      - "DYNAMO_TABLE=emails"
      - "REGION=us-east-1"
      - "S3_BUCKET=emails"
      - "S3_ENDPOINT=http://localstack:4572"
    command: ...
```

You must be able to switch instances of AWS services in your lambda handler. E.g.:

```javascript
let s3 = new aws.S3({});
let dynamo = new aws.DynamoDB({ region: process.env.REGION });

export function setS3(client) { 
  s3 = client;
}
  
export function setDynamo(client) { 
  dynamo = client;
}

export const handler = middy(() => {
  
});
```

And finally instantiate AWS services with mocked endpoints in the tests and switch them for the handler too:

```javascript
import * as lambda from '../lambda';

const s3 = new aws.S3({
  s3ForcePathStyle: true,
  endpoint: new aws.Endpoint(process.env.S3_ENDPOINT),
  sslEnabled: false,
});
lambda.setS3(s3);

const dynamo = new aws.DynamoDB({
  region: process.env.REGION,
  endpoint: process.env.DYNAMO_ENDPOINT,
});
lambda.setDynamo(dynamo);
``` 
