#!/usr/bin/env node

const { App } = require('@aws-cdk/core');
const { PipelineStack } = require('../infra/pipeline-stack');

const app = new App();
new PipelineStack(app, 'Blog-Pipeline', {
  stackName: 'Blog-Pipeline',
  description: 'Pipeline stack for Baseline blog.'
});

app.synth();