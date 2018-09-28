'use strict';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';  // Allows use of HTTPS via alb directly, with a non-matching certificate

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const dynamo = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });
const lambda = new AWS.Lambda();
const axios = require('axios');

// TODO: Get values from config
const serviceName = 'wnsfe-test-dev';
const someTable = `${serviceName}-some-table`;
const someBucket = `${serviceName}-some-bucket`;
const someFile = 'some-file.txt';

// Axios http invoke
module.exports.handler = async (event, context) => {
  const count = 100;
  const invokeData = {functionName: 'lambda-hello-dev-hello', payload: {}};

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
    await invoke(invokeData);
  });
  const lambdaHelloInvokeAsyncLatency = await testLatency(count, async () => {
    await invokeAsync(invokeData);
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
  const fargateHelloHttpsLatency = await testLatency(count, async () => {
    await axios.get('https://fargate-hello-684579960.eu-west-1.elb.amazonaws.com');
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
    fargateHelloHttpsLatency,
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

const invoke = (
  {
    functionName,
    payload
  }
) => {
  return lambda.invoke({
    FunctionName: functionName,
    Payload: JSON.stringify(payload)
  }).promise();
};

const invokeAsync = (
  {
    functionName,
    payload
  }
) => new Promise((resolve, reject) => {
  lambda.invokeAsync(
    {
      FunctionName: functionName,
      InvokeArgs: JSON.stringify(payload)
    },
    (err, data) => {
      if (err == null) {
        resolve(data);
      } else {
        reject(err);
      }
    }
  );
});

const putSomeDocument = async () => {
  await dynamo.put({
    TableName : someTable,
    Item: {
        'someKey': 'someValue'
    }
  }).promise();
};


const getSomeDocument = async () => {
  await dynamo.get({
    TableName: someTable,
    Key: {
        'someKey': 'someValue'
    }
  }).promise();
};

const putSomeFile = async () => {
  await s3.putObject({
    Body: '',
    Bucket: someBucket,
    Key: someFile
  }).promise();
};

const getSomeFile = async () => {
  await s3.getObject({
    Bucket: someBucket,
    Key: someFile
  }).promise();
};
