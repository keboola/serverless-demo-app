'use strict';

const _ = require('lodash');
const { UserError, RequestHandler } = require('@keboola/serverless-request-handler');

module.exports.handler = (event, context, callback) => RequestHandler.handler(() => {
  console.log('EVENT', event);
  const promise = new Promise(res => res('OK'));
  return RequestHandler.responsePromise(promise, event, context, callback);
}, event, context, callback);
