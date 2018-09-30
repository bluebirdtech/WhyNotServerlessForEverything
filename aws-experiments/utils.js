
const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const dynamo = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });
const lambda = new AWS.Lambda();
const http = require('http');
const https = require('https');

const someFile = 'some-file.txt';

const httpGet = (url) => new Promise((resolve, reject) => {
  http.get(url, (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
      data += chunk;
    });
    resp.on('end', () => {
      resolve(data);
    });
  }).on("error", (err) => {
    reject(err);
  });
});

const httpsGet = (url) => new Promise((resolve, reject) => {
  https.get(url, (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
      data += chunk;
    });
    resp.on('end', () => {
      resolve(data);
    });
  }).on('error', (err) => {
    reject(err);
  });
});

const lambdaInvoke = functionName => 
  lambda.invoke({
    FunctionName: functionName,
    Payload: '{}'
  }).promise();

const lambdaInvokeAsync = functionName => 
  lambda.invokeAsync({
    FunctionName: functionName,
    InvokeArgs: '{}'
  }).promise();

const putSomeDocument = () => 
  dynamo.put({
    TableName : process.env.SOME_TABLE_NAME,
    Item: {
      'someKey': 'someValue'
    }
  }).promise();

const getSomeDocument = () => 
  dynamo.get({
    TableName: process.env.SOME_TABLE_NAME,
    Key: {
      'someKey': 'someValue'
    }
  }).promise();

const putSomeFile = () =>
  s3.putObject({
    Body: '',
    Bucket: process.env.SOME_BUCKET_NAME,
    Key: someFile
  }).promise();

const getSomeFile = () =>
  s3.getObject({
    Bucket: process.env.SOME_BUCKET_NAME,
    Key: someFile
  }).promise();

module.exports = {
  httpGet,
  httpsGet,
  lambdaInvoke,
  lambdaInvokeAsync,
  putSomeDocument,
  getSomeDocument,
  putSomeFile,
  getSomeFile
};