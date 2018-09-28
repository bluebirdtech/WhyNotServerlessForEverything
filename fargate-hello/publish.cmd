docker tag fargate-hello-app 211754290204.dkr.ecr.eu-west-1.amazonaws.com/fargate-hello
aws ecr get-login --no-include-email
REM TODO: run the login command outputted from the above command
docker push 211754290204.dkr.ecr.eu-west-1.amazonaws.com/fargate-hello