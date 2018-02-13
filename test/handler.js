'use strict';

const _ = require('lodash');
const expect = require('unexpected');
const handler = require('../src/handler');

describe('Test handler', () => {
  it('Handle', () =>
    handler.handler({
      Records: [
        {
          eventName: 'ObjectCreated:Put',
          s3: {
            bucket: {
              name: process.env.S3_BUCKET,
            },
            object: {
              key: incomingKey,
            },
          },
        },
      ],
    }, {}, () => expect(s3.headObject({ Bucket: process.env.S3_BUCKET, Key: incomingKey }).promise(), 'to be rejected')
        .then(() => s3.listObjects({ Bucket: process.env.S3_BUCKET, Prefix: `${projectId}/${config}/${email}` }).promise())
        .then((res) => {
          expect(res, 'to have key', 'Contents');
          expect(res.Contents, 'to have length', 1);
          return res.Contents[0].Key;
        })
        .then(key => s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: key }).promise())
        .then(() => dynamo.deleteItem({
          Key: {
            Project: { N: `${projectId}` },
            Config: { S: config },
          },
          TableName: process.env.DYNAMO_TABLE,
        }).promise())
      ))
  );
});
