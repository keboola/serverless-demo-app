const _ = require('lodash');
const expect = require('unexpected');

describe('Functional test', () => {
  const incomingFile = `test_${Math.random()}`;
  const incomingKey = `_incoming/${incomingFile}`;
  const projectId = _.random(1, 128);
  const config = uniqid();
  const email = `${projectId}-${config}-${uniqid()}@import.test.keboola.com`;
  const file = _.replace(fs.readFileSync(`${__dirname}/email`), '{{EMAIL}}', email);

  it('Check deployed lambda', () =>
    dynamo.putItem({
      Item: {
        Project: { N: `${projectId}` },
        Config: { S: config },
        Email: { S: email },
      },
      TableName: process.env.DYNAMO_TABLE,
    }).promise()
      .then(() => s3.putObject({
        Body: file,
        Bucket: process.env.S3_BUCKET,
        Key: incomingKey,
      }).promise())
      .then(() => sleep(5000))
      .then(() => expect(s3.headObject({ Bucket: process.env.S3_BUCKET, Key: incomingKey }).promise(), 'to be rejected'))
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
    );
});
