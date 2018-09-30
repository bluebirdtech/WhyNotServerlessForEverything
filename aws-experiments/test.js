'use strict';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';  // Allows use of HTTPS via alb directly, with a non-matching certificate

const axios = require('axios');
const utils = require('./utils');

module.exports.handler = async (event, context) => {
  const count = 100;
  const functionName = 'lambda-hello-dev-hello';

  const dynamoPutLatency = await testLatency(count, async () => {
    await utils.putSomeDocument();
  });
  const dynamoGetLatency = await testLatency(count, async () => {
    await utils.getSomeDocument();
  });

  const s3PutLatency = await testLatency(count, async () => {
    await utils.putSomeFile();
  });
  const s3GetLatency = await testLatency(count, async () => {
    await utils.getSomeFile();
  });

  const lambdaHelloInvokeLatency = await testLatency(count, async () => {
    await utils.lambdaInvoke(functionName);
  });
  const lambdaHelloInvokeAsyncLatency = await testLatency(count, async () => {
    await utils.lambdaInvokeAsync(functionName);
  });
  const lambdaHello128MBInvokeLatency = await testLatency(count, async () => {
    await utils.lambdaInvoke(`${functionName}128MB`);
  });
  const lambdaHello512MBInvokeLatency = await testLatency(count, async () => {
    await utils.lambdaInvoke(`${functionName}512MB`);
  });
  const lambdaHello3008MBInvokeLatency = await testLatency(count, async () => {
    await utils.lambdaInvoke(`${functionName}3008MB`);
  });

  if(process.env.REGION !== 'eu-west-1') {
    return {
      dynamoPutLatency,
      dynamoGetLatency,
      s3PutLatency,
      s3GetLatency,
      lambdaHelloInvokeLatency,
      lambdaHelloInvokeAsyncLatency,
      lambdaHello128MBInvokeLatency,
      lambdaHello512MBInvokeLatency,
      lambdaHello3008MBInvokeLatency
    };
  }

  const lambdaHelloCSharpInvokeLatency = await testLatency(count, async () => {
    await utils.lambdaInvoke('lambda-dotnet-hello-dev-hello');
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
    await utils.httpGet('http://fargate-hello-684579960.eu-west-1.elb.amazonaws.com');
  });
  const fargateHelloHttpsLatency = await testLatency(count, async () => {
    await axios.get('https://fargate-hello-684579960.eu-west-1.elb.amazonaws.com');
  });
  const fargateHelloHttpsStandardLatency = await testLatency(count, async () => {
    await utils.httpsGet('https://fargate-hello-684579960.eu-west-1.elb.amazonaws.com');
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
    lambdaHello128MBInvokeLatency,
    lambdaHello512MBInvokeLatency,
    lambdaHello3008MBInvokeLatency,
    lambdaHelloCSharpInvokeLatency,
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
  // Run once first to avoid impact of cold-start on timings
  await action();

  const start = (new Date).getTime();

  for(let i = 0; i < count; i++) {
    await action();
  }

  const avgDuration = ((new Date).getTime()-start) / count;
  return avgDuration;
}
