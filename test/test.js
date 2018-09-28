'use strict';

const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const axios = require('axios');

const testLatency = async (count, action) => {
  const start = (new Date).getTime();

  for(let i = 0; i < count; i++) {
    await action();
  }

  const avgDuration = ((new Date).getTime()-start) / count;
  return avgDuration;
}

// Axios http invoke
module.exports.handler = async (event, context) => {
  const count = 100;
  const data = {functionName: "lambda-hello-dev-hello", payload: {}};
  
  const lambdaHelloInvokeLatency = await testLatency(count, async () => {
    await lambda.invoke(createAsyncInvokeParams(data)).promise();
  });
  const lambdaHelloInvokeAsyncLatency = await testLatency(count, async () => {
    await invokeAsync(data);
  });
  const lambdaHelloHttpsLatency = await testLatency(count, async () => {
    await axios.get('https://b0bq5ifdr4.execute-api.eu-west-1.amazonaws.com/dev/hello');
  });
  const fargateHelloHttpLatency = await testLatency(count, async () => {
    await axios.get('http://fargate-hello-684579960.eu-west-1.elb.amazonaws.com');
  });

  return {
    lambdaHelloInvokeLatency,
    lambdaHelloInvokeAsyncLatency,
    lambdaHelloHttpsLatency,
    fargateHelloHttpLatency
  };
};

// // Lambda invoke, promises
// module.exports.handler = async (event, context) => {
//   const start = (new Date).getTime();
//   const params = {functionName: "my-service-dev-hello", payload: {start}};

//   await nativeInvoke(params);
//   console.log(`${contextId} :: test end: ${(new Date).getTime()-start}`);
// };

// Lambda invoke, no promises
// module.exports.handler = (event, context, callback) => {
//   const start = (new Date).getTime();
//   const params = {functionName: "my-service-dev-hello", payload: {start}};

//   lambda.invoke(createAsyncInvokeParams(params), (err, data) => {
//     if (err == null) {
//       console.log(`${contextId} :: test end: ${(new Date).getTime()-start}`);
//       callback(null, null);
//     } else {
//       callback(err, null);
//     }
//   });
// };


// const wrapperPromiseInvoke = params => new Promise((resolve, reject) => {
//   lambda.invoke(createAsyncInvokeParams(params), (err, data) => {
//     if (err == null) {
//       resolve(data);
//     } else {
//       reject(err);
//     }
//   });
// });

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

const createAsyncInvokeParams = (
  {
    functionName,
    payload
  }
) => ({
  FunctionName: functionName,
  Payload: JSON.stringify(payload)
});

