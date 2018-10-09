# WhyNotServerlessForEverything

### Show slides
```
cd slides
npm run reveal-md /src/index.md
```

### Setup for experiments
First deploy the hello world apps that are used by the experiments.

```
cd lambda-hello
npm install
npm run deploy
```

```
cd lambda-dotnet-hello
npm install
./src/build
npm run deploy
```

```
cd fargate-hello
npm install
cd infrastructure
terraform init
terraform apply
cd ..
Update publish.cmd with the URL of the ECR created by terraform
./build  (builds docker image)
./publish  (publishes image to ECR)
```

### Run experiments
```
cd aws-experiments
npm install
npm run deploy
npm run l  (for latencyTest)
npm run c  (for coldStartTest)
```
