import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as path from 'path'; 

interface LambdaConstructProps {
  bucket: s3.Bucket;
  table: dynamodb.Table;
  topic: sns.Topic;
  queue: sqs.Queue;
  dlq: sqs.Queue;
}

export class LambdaConstruct extends Construct {
  public readonly logImageLambda: lambda.Function;
  public readonly removeImageLambda: lambda.Function;
  public readonly updateStatusLambda: lambda.Function;
  public readonly statusUpdateMailerLambda: lambda.Function; 

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    const logImageLambda = new lambda.Function(this, 'LogImageLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/log-image'),
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    props.table.grantWriteData(logImageLambda);
    props.bucket.grantRead(logImageLambda);

    logImageLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(props.queue)
    );

    const removeImageLambda = new lambda.Function(this, 'RemoveImageLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/remove-image'),
      environment: {
        BUCKET_NAME: props.bucket.bucketName,
      },
    });

    props.bucket.grantDelete(removeImageLambda);
    props.dlq.grantConsumeMessages(removeImageLambda);

    removeImageLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(props.dlq)
    );

    const addMetadataLambda = new lambda.Function(this, 'AddMetadataLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/add-metadata'),  
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    props.table.grantWriteData(addMetadataLambda);

    props.topic.addSubscription(
      new subscriptions.LambdaSubscription(addMetadataLambda, {
        filterPolicy: {
          metadata_type: sns.SubscriptionFilter.stringFilter({
            allowlist: ['Caption', 'Date', 'name'],
          }),
        },
      })
    );

    const updateStatusLambda = new lambda.Function(this, 'UpdateStatusLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/update-status'),
      environment: {
        TABLE_NAME: props.table.tableName,
        TOPIC_ARN: props.topic.topicArn,
      },
    });

    props.table.grantReadWriteData(updateStatusLambda);
    props.topic.grantPublish(updateStatusLambda);

    props.topic.addSubscription(
      new subscriptions.LambdaSubscription(updateStatusLambda, {
        filterPolicy: {
          eventType: sns.SubscriptionFilter.stringFilter({
            allowlist: ['StatusUpdate']
          })
        },
      })
    );

    
    this.statusUpdateMailerLambda = new lambda.Function(this, 'StatusUpdateMailerLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/status-update-mailer')),
      environment: {
      }
    });

    props.topic.grantPublish(this.statusUpdateMailerLambda);
    
    props.table.grantReadData(this.statusUpdateMailerLambda); 
    
    this.statusUpdateMailerLambda.addToRolePolicy( 
      new iam.PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'],
      })
    );

    props.topic.addSubscription(
      new subscriptions.LambdaSubscription(this.statusUpdateMailerLambda, { 
        filterPolicy: {
          eventType: sns.SubscriptionFilter.stringFilter({
            allowlist: ['StatusUpdate'],
          }),
        },
      })
    );

    const s3n = require('aws-cdk-lib/aws-s3-notifications');
    
    props.bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SnsDestination(props.topic, {
        messageAttributes: {
          eventType: { dataType: 'String', stringValue: 'ObjectCreated' }
        }
      }),
      { suffix: '.jpeg' }
    );
    
    props.bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SnsDestination(props.topic, {
        messageAttributes: {
          eventType: { dataType: 'String', stringValue: 'ObjectCreated' }
        }
      }),
      { suffix: '.png' }
    );
  }
}