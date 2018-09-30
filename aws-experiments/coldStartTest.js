'use strict';

const AWS = require('aws-sdk');
const utils = require('./utils');

module.exports.handler = async (event, context) => {
  const functionName = 'lambda-hello-dev-hello';

  const parallelCount = 10;

  const firstInvokes = await parallelTestLatency(parallelCount, async () => 
    await utils.lambdaInvoke(functionName)
  );

  const secondInvokes = await parallelTestLatency(parallelCount, async () => 
    await utils.lambdaInvoke(functionName)
  );

  return {
    firstInvokes,
    secondInvokes
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
    isColdStart: payload.headers["is-cold-start"],
    executionContextId: payload.headers["execution-context-id"]
  };
}
