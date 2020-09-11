---
layout: post.njk
title: How I launched Baseline in two weeks.
date: 2020-03-29 17:15:00
cover: /assets/climber.jpg
author: nonken
---

> I am writing this series of posts during the Corona pandemic, and it feels odd
to write a post about building a product in such time. There are clearly more
pressing issues for many of us. Maybe this will give some of you a bit of a
distraction or inspiration to get away from the difficult moments many of us are
facing these days. Maybe you'll find these posts after this crisis is over. I
hope they can provide some value to you. Let's dive in:
Launching a new product is challenging! There are so many choices you need to
make: Who is your customer? Will your idea provide value to the customer? What
tech stack, UI/UX, what is a minimal delightful product experience, pricing,
marketing?.. woaaa, and this is by far not all.. it is basically a huge list.

And, there is no one approach to make this happen.

The path I took is one of many, maybe it can give you some ideas of what you can
do, or ideas of what not do to. This path allowed me to build Baseline within
two weeks and end up with a simple, but working product - not just smoke and
mirrors! I can work with this and validate the idea. I can look for the first
folks to onboard to Baseline. I can see if I am roughly in a space where I can
provide something useful to potential customers.

I'll split this post into a series of posts, so we can focus on individual
topics and go into some of the details.

The idea

The idea for Baseline was brewing in my mind for longer. I wanted to make it
easy for teams to audit who within a team or company had access to all the
different SaaS services they would be using. It is a simple idea, but maybe can
provide value to a lot of teams out there. Imagine a team of 25 people, all
having access to Slack, some to GitHub, some to Stripe, etc. How do you keep an
overview? How do you on-board / off-board? How do you make sure MFA is enabled
for all?

I've experienced this many times in my working life. Sometimes folks would just
rely on a miracle to maintain access or sometimes folks would use a sporadically
maintained spreadsheet. Really kind of a crazy situation if you think about it.
You probably have experienced this as well.

The idea for Baseline was born.

Dealing with (really sensitive) customer data

As I thought about Baseline, another topic came up a lot: Customer Data Privacy
and Ownership. I think that we need to rethink how we are dealing with customer
data as software engineers, cloud-based companies and even society as a whole.
As someone who writes code, I know very well that it is incredibly easy to treat
customer data as an abstract thing. Something you don't really need to worry
about in itself. It is a means to making the product happen and providing some
value to the customer. We often don't treat customer data as something the
customer owns and should always have access to. As something we always need to
treat with utmost respect and care.

I think this is wrong.

Here is why: For a service like Baseline to work, you need to grant Baseline at
a minimum read-only access to all the services you want to audit. This means
that you provide Baseline with access keys to a lot of services you use. You'd
fully trust Baseline with taking care of your keys. In a classic architecture,
we'd just store your keys in a database, hopefully encrypted at rest. Your
access keys to all your services next to some other customers access keys! Like
a big cupboard with all they keys to all houses in the neighbourhood.

House owners don't want this, but also the cupboard owner shouldn't want this.
That is crazy!

I will never ever want to get that call at night, telling me that somehow these
access keys were exposed 🥴.

So I wondered about how I can solve this without building a sophisticated
security architecture taking months of development time.

Say hi to the customers computer

What if I would build Baseline in a way that the access keys are stored on the
customers computer. Encrypted with a key, protected with a passphrase the user
chooses? I'd need a simple client, maybe a CLI or GUI which reads those access
keys and forward them to Baseline. Baseline would only access those keys in
memory as part of the operation which calls the SaaS service endpoints. And
importantly, it would never hold all keys in memory at one given time.

This seemed like a doable approach, especially for a minimal delightful product.
It has UX drawbacks, but I decided that those were weighing less for the initial
release. All my concerns around security were addressed and security is very
tight with this approach. The user fully owns their data. And unless the user
shared their passphrase, the encrypted data is unusable to anyone in case the
users computer gets compromised. And even then, the blast radius would be
limited to the users computer, not all of Baselines users.

More benefits from this approach

It turned out, this approach would get me to a launch even faster: I solved
security and data ownership but had another time consuming thing to solve:
access control, signup, billing, account recovery, all the classic SaaS
bootstrapping stuff.

Since I decided to store encrypted access keys on the users computer and build a
light weight client, I figured, I could skip all the SaaS bootstrapping (signup,
account management, billing, etc). Instead I could just build a simple API
endpoint which would receive the access keys, call the SaaS services, like a
forward proxy, and return the normalized response to the client running on the
users computer. Bingo! And on top of this, I could implement billing by storing
an encrypted license token on the computer which would be passed along with each
API request.

The Baseline CLI was born.I realized that a CLI might not be the most amazing
user experience, especially for non-developers, but also was willing to
initially only target software development teams or folks who would not be
blocked by this. This will evolve over time.

So here I was, cooking up an approach for data ownership and security, a simple
architecture with low infrastructure and maintenance overhead and no line of
code written yet.

As a last exercise I decided to write a Working Backwards document, similar to
what product teams at Amazon do. In this Working Backwards document, you also
write a paragraph describing the customer experience. This is the actual text I
wrote:

Victoria visits https://baseline.dev and downloads the Baseline CLI. After the
download completed, Victoria can now run the Baseline CLI to kick off the first
baseline. She is asked to provide a password to encrypt the access keys and the
Baseline CLI opens the browser. Victoria can now select the services she is
using and would like to audit. She picks Slack, Google Apps, and GitHub. After
Victoria has authenticated all services the first baselining operation gets
kicked off. After a few seconds a report is opened in the browser which shows
who has access to which services, nicely grouped by user. Victoria now has a
full picture of who is accessing which services and can for instance also
confirm that everybody has MFA enabled. One of the members in her team didn't
have MFA enabled. After completion, Victoria is asked whether she wants to get a
reminder to run another baseline in one month, a quarter or 6 months.

Conclusion

I spent some time thinking about the product and then sat down to work out a
light weight plan for the overall architecture and product experience. Having
these concerns around data privacy eventually led to a simpler initial
architecture and a product I was able to launch a lot more quickly.

Will this approach work for other product ideas? I can't tell - but I can tell
you that I went into this with the expectation that I had to build a complete
service before I could really validate this product idea. And that expectation
completely changed as I spent some time thinking and writing about the product
before writing actual code.

In the next post I'll dive into the infrastructure setup and the technical
stack. Follow me on Twitter if you want to be kept in the loop @nonken. If you
want to discuss this post, please reply to this tweet.

Until soon, stay safe, and happy baselining!