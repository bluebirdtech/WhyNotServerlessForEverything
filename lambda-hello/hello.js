'use strict';

const uuid = require("uuid/v4");

let executionContextId;

module.exports.handler = async (event, context) => {

  let isColdStart = false;
  if(executionContextId === undefined) {
    executionContextId = uuid();
    isColdStart = true;
  }

  const response = {
    statusCode: 200,
    headers: {
      "content-type": "text/html",
      executionContextId,
      isColdStart
    },
    body: "Hello World!"
  };

  return response;
};
