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
add-metadata

aws sns list-topics --region eu-west-1

aws sns publish --topic-arn "ARN" --message-attributes file://d:/SETU/distrubuted/Event-Driven/attributes.json --message file://d:/SETU/distrubuted/Event-Driven/message.json --region eu-west-1