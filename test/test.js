'use strict';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';  // Allows use of HTTPS via alb directly, with a non-matching certificate

const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const axios = require('axios');

// Axios http invoke
module.exports.handler = async (event, context) => {
  const count = 100;
  const invokeData = {functionName: 'lambda-hello-dev-hello', payload: {}};

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
