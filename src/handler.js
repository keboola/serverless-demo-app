'use strict';

const { RequestHandler } = require('@keboola/serverless-request-handler');

module.exports.handler = (event, context, callback) => RequestHandler.handler(() => {
  const promise = new Promise(res => res('OK'));
  return RequestHandler.responsePromise(promise, event, context, callback);
}, event, context, callback);
