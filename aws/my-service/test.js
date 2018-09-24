'use strict';

const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
//const axios = require('axios');
const http = require('https');

const contextId = Math.random();

// Node http invoke
module.exports.handler = (event, context, callback) => {
  const start = (new Date).getTime();

  const options = {
    hostname: 'kbsx06oiod.execute-api.eu-west-2.amazonaws.com',
    port: 443,
    path: '/dev/hello',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': 2
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';

    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`${contextId} :: test end: ${(new Date).getTime()-start}`);
      callback(null, null);
    });
  });
  
  req.on('error', (e) => {
    console.error(e);
  });
    
  req.write('{}');
  req.end();
};

// Axios http invoke
// module.exports.handler = async (event, context) => {
//   const start = (new Date).getTime();

//   await axios.post('https://kbsx06oiod.execute-api.eu-west-2.amazonaws.com/dev/hello', {});

//   console.log(`${contextId} :: test end: ${(new Date).getTime()-start}`);
// };

// Lambda invoke, promises
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

const nativeInvoke = params => {
  return lambda.invoke(createAsyncInvokeParams(params)).promise();
};

const wrapperPromiseInvoke = params => new Promise((resolve, reject) => {
  lambda.invoke(createAsyncInvokeParams(params), (err, data) => {
    if (err == null) {
      resolve(data);
    } else {
      reject(err);
    }
  });
});

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

