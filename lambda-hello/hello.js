'use strict';

const contextId = Math.random();

module.exports.handler = async (event, context) => {
  console.log(`${contextId} :: hello`)
  const response = {
    statusCode: 200,
    headers: {"content-type": "text/html"},
    body: "Hello World!"
  };

  return response;
};
