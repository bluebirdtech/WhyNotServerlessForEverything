aws s3api create-bucket --region "eu-west-1" --create-bucket-configuration LocationConstraint="eu-west-1" --bucket "fargate-hello-terraform-state"
aws dynamodb create-table --region eu-west-1 --table-name fargate-hello-terraform-lock --attribute-definitions AttributeName=LockID,AttributeType=S --key-schema AttributeName=LockID,KeyType=HASH --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1