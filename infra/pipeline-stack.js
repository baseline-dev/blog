const { Artifact } = require('@aws-cdk/aws-codepipeline');
const { CdkPipeline, SimpleSynthAction, ShellScriptAction } = require('@aws-cdk/pipelines');
const { Stack, SecretValue } = require('@aws-cdk/core');
const { GitHubSourceAction, GitHubTrigger } = require('@aws-cdk/aws-codepipeline-actions');
const { Effect, PolicyStatement } = require('@aws-cdk/aws-iam');
const { Application } = require('./application-stage');

class PipelineStack extends Stack {
  constructor(app, id, props) {
    super(app, id, props);

    const sourceArtifact = new Artifact('src');
    const cloudAssemblyArtifact = new Artifact('asmb');
    const { owner, name, secretArn, branch } = this.node.tryGetContext('repo');

    const pipeline = new CdkPipeline(this, 'Blog', {
      pipelineName: 'Blog',
      cloudAssemblyArtifact,

      sourceAction: new GitHubSourceAction({
        actionName: 'GitHub',
        owner,
        repo: name,
        oauthToken: SecretValue.secretsManager(secretArn, {
          jsonField: 'github-token'
        }),
        output: sourceArtifact,
        branch: branch || 'master',
        trigger: GitHubTrigger.WEBHOOK
      }),

      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        buildCommand: 'npm run build',
      }),
    });

    const application = new Application(this, 'Blog-Production', {
      stageName: 'Production',
      description: 'Blog application stack running in us-east-1.'
    });
    
    const stage = pipeline.addApplicationStage(application);

    const action = new ShellScriptAction({
      actionName: 'Clear-Cloudfront',
      commands: [`aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"`],
      useOutputs: {
        DISTRIBUTION_ID: pipeline.stackOutput(application.cloudfrontDistributionId),
      }
    });

    stage.addActions(action);

    action.project.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['cloudfront:GetInvalidation', 'cloudfront:CreateInvalidation'],
      resources: ['*'],
    }));
  }
}

module.exports = { PipelineStack }