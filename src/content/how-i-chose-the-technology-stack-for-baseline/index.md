---
layout: post.njk
title: The Baseline Technology Stack - Part 1.
date: 2020-04-14 16:59:00
cover: /assets/builder.jpg
author: nonken
---

> It is surreal, the Covid-19 pandemic has reached pretty much every place on this
planet. In some countries we're seeing encouraging signs of declining daily
numbers. Others are still in front of their peak. So it is still odd to write
about technology and business. To you, dear reader, I hope you are safe and that
soon you'll be back to a more "normal" life. For now, let me hopefully distract
you with some technical deep dive:
In the last post
[https://blog.baseline.dev/how-i-launched-baseline-in-two-weeks/], I shared some
of the thinking which went into getting the idea for Baseline. I also talked
about some of the fundamental ideas around privacy and security which are at the
core of Baseline and dear to my heart. After I went through the initial exercise
of defining a minimal delightful product, I started thinking about the
technology stack. And, wow, here is another area where you have a pretty much
infinite number of options. Luckily, they were somewhat limited by my skills,
professional experience and my desire to launch fast.

A stack to help you move fast

You can move fast in a whole bunch of different ways. There is moving fast, by
deferring building your product entirely and doing only research and customer
interviews. There is moving fast, by building a functional prototype, maybe a
simple landing page. You do this to get a sense of a potential market. Some call
this market validation. I think: validation means you have a paying customer. So
you need to create some value. Even if it is a tiny bit of value. A potential
customer who says they like an idea is not the same as a paying customer.

None of these ways made sense to me.

On top of this, I have experienced the pain Baseline is trying to solve first
hand and I talked to a few folks who seemed to at least agree that the problems
exist. I needed to find a technical stack that allowed me build a minimal
delightful version of Baseline fast. But how?

Here are three principles that helped me come up with my approach and helped me
to move quickly.

1. Customer data is sacred

I discussed this in the previous post
[https://blog.baseline.dev/how-i-launched-baseline-in-two-weeks/], so I won't go
into more depth here.

2. Automate

When building an online service, you can get very far without automating your
processes. You can provision your infrastructure by just clicking the right
buttons in the AWS console (or GCP, or some other provider). You can wait with
the automation of running tests and run them manually every once in a while.
Heck, you might skip writing tests all-together. You can pass on automated
deployments and manually pull new releases onto your host. And if a deployment
fails, you ssh into the host(s) and fiddle around until it works again.

While I might have been able to move fast without automation initially, I
decided that choosing to wait with this would ultimately cost a lot of time. Not
investing into automating will also turn out to be very prone to errors. So,
automation, even in the early days was something I thought was important.

3. Use tools where they make your life simpler.

When building online services you can end up using a million tools to make your
project happen. Start with service orchestration like Kubernetes, head over to
creating a complete microservice architecture, or to API abstractions like
GraphQL, client-side build tools, CSS frameworks, and finally JavaScript
libraries and frameworks - and check this, I skipped over a lot of possible
choices. You can end up with a fairly complex stack and you'll spend a lot of
time debugging, maintaining and operating this stack.

Then there is also the temptation of using fancy new tech for your new service.
Why not make this new service entirely serverless, move to a new serverless
platform or try out a new client-side architecture?

I recommend: Unless you feel quite familiar with the technology, maybe don't use
it for now. It is OK not to be an expert in everything and not use what is the
new big thing. Use the stack you are familiar with and dive into the next cool
thing when you have some time at hand and maybe one day it'll make it into your
service.

So you wonder about the stack?

Let's do this bottoms up and start with:

Infrastructure.

First of all, where will I host Baseline? I chose AWS. Why? I know AWS fairly
well and I trust AWS when it comes to operational excellence and security. While
there are a ton of AWS services I have never used before, I feel comfortable
building on top of it. And AWS is here to stay and in the event of Baseline
growing, AWS supports everything I could think of. Next up:

Managing infrastructure

Remember how automation was important to me? You can provision everything
manually, or you can choose tools like CloudFormation or Terraform. It will
happen that you want to tear down your stack and recreate it. Especially in the
beginning. I chose the AWS CDK [https://github.com/aws/aws-cdk], which allows
you to define infrastructure as code. Amazing! Here an example of how you set up
a Route53 zone and an ACM certificate:

this.zone = new PublicHostedZone(this, `${stackName}-hosted-zone`, {
  zoneName
});

this.certificate = new DnsValidatedCertificate(this, `${stackName}-certificate`, {
  domainName: certificateDomainName,
  subjectAlternativeNames: [certificateAlternativeDomainName],
  hostedZone: this.zone,
});

Sometime last year I dove into this and set up a complete blueprint which would
automatically provision the following:

DNS:

A Route53 zone with an automatically created free certificate through ACM (AWS
Certificate Manager) so that you can serve traffic over SSL. See the example
above.

Shared Infrastructure:

Shared components such a load-balancer and the VPC.

Web Service:

A CI/CD pipeline for a web service and static assets served via a CloudFront
distribution. The pipeline includes a staging and a production environment.
Traffic is served via SSL (https://) and traffic going over HTTP is redirected
to HTTPS.

Api Service:

A CI/CD pipeline for an api service (control plane). The pipeline includes a
staging and a production environment. Traffic is served via SSL (https://) and
traffic going over HTTP is redirected to HTTPS.

Since I had this blueprint pretty much ready to go, it took only a very short
amount of time to get the entire service infrastructure up and running. I
open-sourced the blueprint on GitHub in case you'd like to copy this pattern or
want to dive into the CDK yourself: Infrastructure bootstrapping for AWS,
powered by AWS CDK. [https://github.com/nonken/hurricane]

Compute

The Blueprint I mentioned above, set up an autoscaling group running EC2
instances. So the default choice for the application compute infrastructure
would have been EC2. But before committing to EC2 I took a little detour:

Lambda / Serverless:

I love Lambda and thought that it actually would be a perfect candidate for
running my simple API service. My service is stateless, and eventually could
even turn into a workflow with Step Functions. As a bonus: I would also easily
fit into the free tier. I dove in, reviewed API Gateway (you need this when
using Lambda), then wondered about how I could test locally and had a look at
the state of AWS SAM [https://github.com/awslabs/aws-sam-cli]. I thought about
authentication/authorization and noticed that I started procrastinating quite a
bit. I wondered about where to host the landing page, whether I could just make
it a static page. I started reviewing serverless frameworks and saw myself
become an expert in this, without shipping Baseline. So I paused. And decided to
look somewhere else.

Note: I still think serverless is a really good tool for the Baseline use case.
I will revisit my choices here again in the future. Once there are a few paying
customers.

Containers:

Should I use Kubernetes, or a container orchestration like ECS? I thought that
this was overkill in my case. Since I was able to provision my entire
infrastructure with a load balancer, autoscaling, etc. through the CDK, I didn't
see the benefit of Kubernetes or ECS - next to running the service in a
container - which I could then use to run locally as well. It is not like I
needed to pack a ton of containers onto a lot of hardware I had running idle and
I don't have a team with whom I'd like to share my dev stack. So I passed on
this as well.

Barebone EC2:

So here we are, back to basics. Running my API and Webservice on a barebone EC2
instance 😱. I ended up choosing EC2 as my compute, because this was something I
was very familiar with. I could develop / test Baseline locally, commit to
GitHub and then automatically deploy to one or more EC2 instances. I could even
roll back faulty deployments. Simple.

Keeping cost down

My current setup might not be the most cost-efficient way of running
infrastructure but it works very well for me. It is not very efficient because I
am underutilizing many of the services I am paying for.

But wait, I found a (temporary) solution for managing cost as well. Just read on
😊

Running the stack I described above, does not fit into the AWS free tier. And
frankly, it is not nice to spend money on infrastructure while the service
doesn't make any money yet. AWS Activate [https://aws.amazon.com/activate/] to
the rescue. I applied for the Founders program and 7 days later USD 1000,- of
credits appeared in my account. This would provide enough runway for operating
the infrastructure to prove that Baseline can be a viable business. Win!

So here we are, I have a solid infrastructure setup, CI/CD, I figured out a way
to manage operational cost, I could now push code to GitHub, run automated tests
and automatically deploy the artifacts. I could even scale the platform. And I
can operate this for a while without paying a dime. But I was not done yet. The
world of front-end / client-side was still waiting with its infinite amount of
libraries/frameworks and build tools.

I will report on this in the next post 😅

Follow me on Twitter [https://twitter.com/nonken] if you are curious about the
Baseline journey.  I'd love to hear what your stack of choice is for launching a
new service, please share as a reply to this tweet
[https://twitter.com/nonken/status/1249997498728488961]. And go checkout
Baseline by requesting an invite here [https://baseline.dev/].

Until soon, stay safe, and happy baselining!

Disclaimer 1: Oh! And as I proofread this post, I notice, I don't have a
database! Yes! I don't have a database. No need to worry about backups,
migrations, and all the dance around databases 🎉.

Disclaimer 2: Ultimately, do what works for you. Be careful of getting
distracted by things which don't help you move to your goal and be careful of
voices who tell you there is one right way. The chance is high that you might
pick a completely different stack and launch a successful service.

That is the beauty of building things.