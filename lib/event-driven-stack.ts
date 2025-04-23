import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sns_subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
import { StorageConstruct } from './constructs/storage-construct';
import { MessagingConstruct } from './constructs/messaging-construct';
import { LambdaConstruct } from './constructs/lambda-construct';

export class EventDrivenStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const storage = new StorageConstruct(this, 'Storage');

    const messaging = new MessagingConstruct(this, 'Messaging');

    const lambdas = new LambdaConstruct(this, 'Lambdas', {
      bucket: storage.imageBucket,
      table: storage.imageTable,
      topic: messaging.imageTopic,
      queue: messaging.imageQueue,
      dlq: messaging.imageDLQ,
    });


  }
}
