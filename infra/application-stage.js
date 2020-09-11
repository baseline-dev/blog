const { Stage, CfnOutput } = require('@aws-cdk/core');
const { BlogStack } = require('./blog');

class Application extends Stage {
  constructor(scope, id, props) {
    super(scope, id, props);

    this.docsStack = new BlogStack(this, 'Blog', {});

    this.cloudfrontDistributionId = new CfnOutput(this.docsStack, 'BlogDistributionId', {
      value: this.docsStack.productionDistribution.distributionId
    });
  }
}

module.exports = {
  Application
}