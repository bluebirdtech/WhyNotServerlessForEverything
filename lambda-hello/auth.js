'use strict';

module.exports.handler = async (event, context) => {
  return {
    principalId: "somePrincipalId",
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: event.methodArn
        }
      ]
    }
  };
};
