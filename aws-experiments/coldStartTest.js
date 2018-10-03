'use strict';

const AWS = require('aws-sdk');
const utils = require('./utils');

module.exports.handler = async (event, context) => {
  const parallelCount = 10;

  const lambdaNodeColdStartLatency = await testColdStartLatency(parallelCount, 'lambda-hello-dev-hello');
  const lambdaDotnetColdStartLatency = await testColdStartLatency(parallelCount, 'lambda-dotnet-hello-dev-hello');

  return {
    lambdaNodeColdStartLatency,
    lambdaDotnetColdStartLatency
  };
};

const testColdStartLatency = async (parallelCount, functionName) => {
  const invokes = await parallelTestLatency(parallelCount, async () => 
    await utils.lambdaInvoke(functionName)
  );

  return {
    invokes
  };
};

const parallelTestLatency = (parallelCount, action) => {
  const promises = [];
  for(let i = 0; i < parallelCount; i++) {
    var promise = testLatency(action);
    promises.push(promise);
  }
  return Promise.all(promises);
};

const testLatency = async (action) => {

  const start = (new Date).getTime();

  const response = await action();
  const payload = JSON.parse(response.Payload);

  const duration = (new Date).getTime()-start;

  return {
    duration,
    isColdStart: payload.headers.isColdStart,
    executionContextId: payload.headers.executionContextId
  };
}
