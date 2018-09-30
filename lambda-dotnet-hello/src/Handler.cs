using Amazon.Lambda.Core;
using System;

[assembly:LambdaSerializer(typeof(Amazon.Lambda.Serialization.Json.JsonSerializer))]

namespace AwsDotnetCsharp
{
    public class Handler
    {
        public static string ExecutionContextId = null;

        public object Hello()
        {
            var isColdStart = false;
            if(ExecutionContextId == null) {
                ExecutionContextId = Guid.NewGuid().ToString();
                isColdStart = true;
            }

            return new {
                statusCode = 200,
                headers = new {
                    executionContextId = ExecutionContextId,
                    isColdStart = isColdStart
                },
                body = "Hello World!"
            };
        }
    }
}
