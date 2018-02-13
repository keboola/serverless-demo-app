# Demo Serverless App

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![Build Status](https://travis-ci.org/keboola/serverless-demo-app.svg)](https://travis-ci.org/keboola/serverless-demo-app)

A sample serverless app using AWS Lambda

## Usage

1. Download the repository: `git clone git@github.com:keboola/serverless-demo-app.git`
2. Update the handler and/or create new one
    1. Update source code in [src/handler.js](https://github.com/keboola/serverless-demo-app/blob/master/src/handler.js)
    2. Update `functions` section of [serverless.yml](https://github.com/keboola/serverless-demo-app/blob/master/serverless.yml)
3. CloudFormation template [cf-template.json](https://github.com/keboola/serverless-demo-app/blob/master/cf-template.json) contains user policy for service deployment to AWS and user policy for functional tests. Update it if you use other AWS resources.
4. 

## Installation

1. Download git repository: `git clone git@github.com:keboola/serverless-demo-app.git`
2. Create a stack [cf-template.json](https://github.com/keboola/serverless-demo-app/blob/master/cf-template.json) with IAM policies and user groups for deployment and functional testing. You will need to fill parameters:
    - `ServiceName` - should be the same as `SERVICE_NAME` env var (e.g. `dev-serverless-demo-app-lambda`)
    - `KeboolaStack` - should be the same as `KEBOOLA_STACK` env var (e.g. `dev-serverless-demo-app`)
    - `Stage` - one of: `dev`, `test`, `prod` (again, should be the same as `STAGE` env var)
3. Create an IAM user for deployment (e.g. `serverless-demo-app-deploy`) and assign it to the group created in previous step. Create AWS credentials.
4. Create an IAM user for testing (e.g. `serverless-demo-app-testing`) and assign it to the group created in previous step. Create AWS credentials.
5. Create `.env` file from template [.env.template](https://github.com/keboola/serverless-demo-app/blob/master/.env.template)
6. Run `docker-compose run --rm dev-deploy`

### CI and deployment

CI is configured on Travis, see https://travis-ci.org/keboola/serverless-demo-app. Deployment is run automatically after releasing a version on GitHub.
