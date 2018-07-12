# Demo Serverless App

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![Build Status](https://travis-ci.org/keboola/serverless-demo-app.svg)](https://travis-ci.org/keboola/serverless-demo-app)
[![Maintainability](https://api.codeclimate.com/v1/badges/75829e3775f6c1905a14/maintainability)](https://codeclimate.com/github/keboola/serverless-demo-app/maintainability)

A sample serverless app using AWS Lambda


## Architecture

- Our serverless apps use [Serverless Framework](https://serverless.com/framework/docs/providers/aws/guide/intro/).
- AWS Lambda understands Node 8.1 only. Therefore we use Babel to compile source code during deployment which allows us to use new language features. 
- The source code is bundled by Webpack during deployment. 
    - There is `source-map` support for translation of error stack traces to original sources. 
- Enclosed plugin creates another lambda function on the fly which subscribes to CloudWatch logs of other functions and sends them to Papertrail.

### Code style

- We expect compliance with enclosed ESLint rules based on `airbnb-base` code style.
- It is recommended to use [Flow](https://flow.org/) extension for static type checking. The setup supports its translation to Javascript using Babel.
- The repository should have active code quality checking using [Code Climate](https://codeclimate.com/github/keboola/serverless-demo-app) service. Enclosed config utilizes `eslint`, `duplication` and `fixme` engines.

### Files structure
- `src` - source code of the functions
- `test` - app and functional tests
- `.babelrc` - definition for Babel compiler
- `.codeclimate.yml` - definition for Code Climate
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
- [`@keboola/serverless-request-handler`](https://github.com/keboola/serverless-request-handler) - a wrapper creating unified response for error states
- `babel-polyfill`, `babel-core`, `babel-loader`, `babel-plugin-transform-runtime`, `babel-preset-env`, `babel-plugin-transform-flow-strip-types`, `babel-preset-flow` - requirements for ES6 translation
- [`lodash`](https://lodash.com/) - utility library
- `source-map-support` - a requirement for translation of error stacks from Webpack compiled code to original source code
- [`@keboola/serverless-default-error-responses`](https://github.com/keboola/serverless-default-error-responses) - adds unified API repsonses for error states
- [`@keboola/serverless-papertrail-logging`](https://github.com/keboola/serverless-papertrail-logging) - redirects logs from CloudWatch to Papertrail
- `aws-sdk` - official AWS SDK (it is in dev dependencies because Lambda runtime in AWS already has it included)
- [`axios`](https://github.com/axios/axios) - a HTTP client for functional testing of API Gateway
- `eslint`, `eslint-config-airbnb-base`, `eslint-plugin-import`, `eslint-plugin-flowtype`, `eslint-plugin-flowtype-errors`, `flow-bin` - requirements for ESLint and Flow
- `mocha`, `nyc` - testing and code coverage framework
- `serverless` - app framework
- `serverless-webpack`, `webpack`, `webpack-node-externals` - requirements for Webpack
- `unexpected` - assertion library


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
- `KEBOOLA_STACK` - AWS tag of created resources, it should be the same for all instances (e.g. `serverless-demo-app`)
- `PAPERTRAIL_PORT` - assigned port of PaperTrail service for logging
- `REGION` - AWS region of deployed service
- `SERVICE_NAME` - used for names of AWS resources, it should be unique (e.g. `jakub-serverless-demo-app`)

Variables used for testing:

- `TEST_AWS_ACCESS_KEY_ID` - IAM credentials of user used for functional testing
- `TEST_AWS_SECRET_ACCESS_KEY` - IAM credentials of user used for functional testing
- `API_ENDPOINT` - http endpoint of created API Gateway (e.g. `https://l217h7oa23.execute-api.eu-west-1.amazonaws.com/dev`)

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

Serverless plugins `@keboola/serverless-request-handler` and `@keboola/serverless-papertrail-logging` handle sending and formatting of CloudWatch logs to Papertrail. Service name is used for log's `hostname` and stage is used for log's `program`. AWS Request id is added to the log so that you can use it for further debug in CloudWatch logs if needed.

The logs look like:

```json
{
    "event": {
        "requestId": "a32d32a5-1228-11e8-91cc-89975b126b44",
        "function": "developer-portal-v2-prod-auth",
        "httpMethod": "POST",
        "path": "/auth/login"
    },
    "statusCode": 200
}
```

Unhandled exceptions or rejected promises are logged with `"statusCode":500` so you can use this phrase to create Papertrail search with alarm. Example:

```json
{
    "event": {
        "requestId": "9ee19e2c-122b-11e8-957c-5387262d222f",
        "function": "jakub-sqldep-analyzer-dev-visualize",
        "httpMethod": "POST",
        "path": "/visualize"
    },
    "statusCode": 500,
    "error": {
        "name": "TypeError",
        "message": "_this.storage.authx is not a function",
        "stack": [
            "TypeError: _this.storage.authx is not a function",
            "    at /var/task/src/lambda/webpack:/src/app/Visualize.js:18:32"
        ]
    }
}
```

## App tests

App tests can run whole handler and check its response, see [test/handler.js](https://github.com/keboola/serverless-demo-app/blob/master/test/handler.js).

## Functional tests

Functional tests should invoke deployed functions externally. Either by calling API Gateway using a HTTP client or by invoking lambda function using AWS SDK. You will find both examples in [test/func.js](https://github.com/keboola/serverless-demo-app/blob/master/test/func.js).

If your handler use other AWS resources, you should check their state in your test. Add permissions to the resources to `FunctionalTestPolicy` in [cf-stack.json](https://github.com/keboola/serverless-demo-app/blob/master/cf-stack.json).

## Installation

1. Download git repository: `git clone git@github.com:keboola/serverless-demo-app.git`
2. Create a stack [cf-stack.json](https://github.com/keboola/serverless-demo-app/blob/master/cf-stack.json) with IAM policies and user groups for deployment and functional testing. You will need to fill parameters:
    - `ServiceName` - should be the same as `SERVICE_NAME` env var (e.g. `dev-serverless-demo-app`)
    - `KeboolaStack` - should be the same as `KEBOOLA_STACK` env var (e.g. `serverless-demo-app`)
    - `Stage` - one of: `dev`, `test`, `prod` (again, should be the same as `STAGE` env var)
3. Create an IAM user for deployment (e.g. `serverless-demo-app-deploy`) and assign it to the group created in previous step. Create AWS credentials.
4. Create an IAM user for testing (e.g. `serverless-demo-app-testing`) and assign it to the group created in previous step. Create AWS credentials.
5. Create `.env` file from template [.env.template](https://github.com/keboola/serverless-demo-app/blob/master/.env.template)
6. Run `docker-compose run --rm dev-deploy`

## CI and deployment

CI is configured on Travis, see https://travis-ci.org/keboola/serverless-demo-app. Deployment to production is run automatically after releasing a version on GitHub.

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

module.exports.setS3 = client => s3 = client;
module.exports.setDynamo = client => dynamo = client;

module.exports.handler = (event, context, callback) => RequestHandler.handler(() => {
  
});
```

And finally instantiate AWS services with mocked endpoints in the tests and switch them for the handler too:

```javascript
const handler = require('../src/handler');

const s3 = new aws.S3({
  s3ForcePathStyle: true,
  endpoint: new aws.Endpoint(process.env.S3_ENDPOINT),
  sslEnabled: false,
});
handler.setS3(s3);

const dynamo = new aws.DynamoDB({
  region: process.env.REGION,
  endpoint: process.env.DYNAMO_ENDPOINT,
});
handler.setDynamo(dynamo);
``` 
