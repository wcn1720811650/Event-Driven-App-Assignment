import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

export class MessagingConstruct extends Construct {
  public readonly imageTopic: sns.Topic;
  public readonly imageQueue: sqs.Queue;
  public readonly imageDLQ: sqs.Queue;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.imageTopic = new sns.Topic(this, 'ImageTopic', {
      displayName: 'Image Processing Topic',
    });

    this.imageDLQ = new sqs.Queue(this, 'ImageDLQ', {
      queueName: 'ImageDLQ',
      retentionPeriod: cdk.Duration.days(14),
    });

    this.imageQueue = new sqs.Queue(this, 'ImageQueue', {
      queueName: 'ImageQueue',
      visibilityTimeout: cdk.Duration.seconds(300),
      deadLetterQueue: {
        queue: this.imageDLQ,
        maxReceiveCount: 3,
      },
    });

    this.imageTopic.addSubscription(
      new subscriptions.SqsSubscription(this.imageQueue, {
        filterPolicy: {
          eventType: sns.SubscriptionFilter.stringFilter({
            allowlist: ['ObjectCreated'],
          }),
        },
      })
    );
  }
}