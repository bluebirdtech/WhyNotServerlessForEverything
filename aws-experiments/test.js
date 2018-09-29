'use strict';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';  // Allows use of HTTPS via alb directly, with a non-matching certificate

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const dynamo = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });
const lambda = new AWS.Lambda();
const axios = require('axios');
const http = require('http');
const https = require('https');

const someFile = 'some-file.txt';

module.exports.handler = async (event, context) => {
  const count = 100;
  const functionName = 'lambda-hello-dev-hello';

  const dynamoPutLatency = await testLatency(count, async () => {
    await putSomeDocument();
  });
  const dynamoGetLatency = await testLatency(count, async () => {
    await getSomeDocument();
  });

  const s3PutLatency = await testLatency(count, async () => {
    await putSomeFile();
  });
  const s3GetLatency = await testLatency(count, async () => {
    await getSomeFile();
  });

  const lambdaHelloInvokeLatency = await testLatency(count, async () => {
    await lambdaInvoke(functionName);
  });
  const lambdaHelloInvokeAsyncLatency = await testLatency(count, async () => {
    await lambdaInvokeAsync(functionName);
  });
  const lambdaHelloHttpsLatency = await testLatency(count, async () => {
    await axios.get('https://b0bq5ifdr4.execute-api.eu-west-1.amazonaws.com/dev/hello');
  });
  const lambdaHelloHttpsWithAuthorizerLatency = await testLatency(count, async () => {
    await axios.get('https://b0bq5ifdr4.execute-api.eu-west-1.amazonaws.com/dev/hello-with-auth', { 'headers': { 'Authorization': 'someToken' } });
  });
  const fargateHelloHttpLatency = await testLatency(count, async () => {
    await axios.get('http://fargate-hello-684579960.eu-west-1.elb.amazonaws.com');
  });
  const fargateHelloHttpStandardLatency = await testLatency(count, async () => {
    await httpGet('http://fargate-hello-684579960.eu-west-1.elb.amazonaws.com');
  });
  const fargateHelloHttpsLatency = await testLatency(count, async () => {
    await axios.get('https://fargate-hello-684579960.eu-west-1.elb.amazonaws.com');
  });
  const fargateHelloHttpsStandardLatency = await testLatency(count, async () => {
    await httpsGet('https://fargate-hello-684579960.eu-west-1.elb.amazonaws.com');
  });
  const fargateHelloDomainHttpLatency = await testLatency(count, async () => {
    await axios.get('http://fargate-hello.passwordpad.com');
  });
  const fargateHelloDomainHttpsLatency = await testLatency(count, async () => {
    await axios.get('https://fargate-hello.passwordpad.com');
  });

  return {
    dynamoPutLatency,
    dynamoGetLatency,
    s3PutLatency,
    s3GetLatency,
    lambdaHelloInvokeLatency,
    lambdaHelloInvokeAsyncLatency,
    lambdaHelloHttpsLatency,
    lambdaHelloHttpsWithAuthorizerLatency,
    fargateHelloHttpLatency,
    fargateHelloHttpStandardLatency,
    fargateHelloHttpsLatency,
    fargateHelloHttpsStandardLatency,
    fargateHelloDomainHttpLatency,
    fargateHelloDomainHttpsLatency
  };
};

const testLatency = async (count, action) => {
  const start = (new Date).getTime();

  for(let i = 0; i < count; i++) {
    await action();
  }

  const avgDuration = ((new Date).getTime()-start) / count;
  return avgDuration;
}

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
