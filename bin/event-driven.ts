#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EventDrivenStack } from '../lib/event-driven-stack';

const app = new cdk.App();
new EventDrivenStack(app, 'EventDrivenStack', {
  env: { region: "eu-west-1" },
});