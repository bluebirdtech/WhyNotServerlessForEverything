'use strict';

const contextId = Math.random();

module.exports.handler = async (event, context) => {
  console.log(`${contextId} :: hello`)
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  return response;
};
