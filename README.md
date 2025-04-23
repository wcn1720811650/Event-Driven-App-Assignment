# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## Log new Images
//find the lambda function name

aws lambda list-functions --query "Functions[?contains(FunctionName, 'LogImageLambda')].FunctionName" --region eu-west-1

aws lambda invoke --function-name 
function name --cli-binary-format raw-in-base64-out --payload file://d:\SETU\distrubuted\Event-Driven\log-image-test.json --region eu-west-1 log-output.json

## add-metadata
aws sns list-topics --region eu-west-1

aws sns publish --topic-arn "ARN" --message-attributes file://d:/SETU/distrubuted/Event-Driven/attributes.json --message file://d:/SETU/distrubuted/Event-Driven/message.json --region eu-west-1

## remove-image

aws lambda invoke --function-name EventDrivenStack-LambdasRemoveImageLambdaAF08F1CD-j2doTeAXePAc --cli-binary-format raw-in-base64-out --payload file://d:/SETU/distrubuted/Event-Driven/test-event.json --region eu-west-1 output.json

aws lambda invoke --function-name EventDrivenStack-LambdasRemoveImageLambdaAF08F1CD-j2doTeAXePAc --cli-binary-format raw-in-base64-out --payload file://d:/SETU/distrubuted/Event-Driven/test-event.json --region eu-west-1 output.json

## Status Update Mailer

aws lambda invoke --function-name EventDrivenStack-LambdasStatusUpdateMailerLambda6E-ayLOqlcAY2P0  --cli-binary-format raw-in-base64-out --payload file://d:/SETU/distrubuted/Event-Driven/status-update-test.json --region eu-west-1 status-output.json

## Status updating
aws lambda list-functions --query "Functions[?contains(FunctionName, 'UpdateStatusLambda')].FunctionName" --region eu-west-1

aws lambda invoke --function-name FunctionName --cli-binary-format raw-in-base64-out --payload file://d:\SETU\distrubuted\Event-Driven\update-status-test.json --region eu-west-1 update-status-output.json
