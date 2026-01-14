---
title: "Lessons Learned from Jerks on The Internet"
date: 2021-02-02T12:00:00
url: https://matteing.com/posts/lessons-learned-from-jerks-on-the-internet
slug: lessons-learned-from-jerks-on-the-internet
---

# Lessons Learned from Jerks on The Internet

_Quite an old article, but it's back live on my blog!_

It was a dark, foggy night. In a cozy bed, I laid fast asleep after a long day of university lectures and late-night coding.

Suddenly, a long, annoying noise shook me off my sleep. Crawling to the other side of my bed, I reach my desk and clumsily grab my phone, in an attempt to _shut that shit down_.

It was a call. A call from a [Makerlog](https://getmakerlog.com/) member.

When I saw that caller ID, I instantly knew _something was going down_. And it was not good.

![](https://i.imgur.com/Nt4vukp.png)

It was the beginning of a 2 hour journey into the world of distributed denial-of-service attacks.

### The doctor arrives, half-asleep

From the call alone and the number of people attempting to reach me on various social media, it was easy to provide an initial diagnosis. I knew exactly what happened to the patient: a simple spammer attack with a sprinkle of server crashing.

It was easy to arrive to this initial conclusion. Makerlog's API is very open and it was easy for people to -- accidentally or purposefully -- spam the server with tasks while fooling around.

These attacks would be promptly (and easily) shut down. It was a matter of entering the admin panel, revoking a few tokens, and banning the IP. One of these attacks had happened the day before - no biggie.

Still in bed, I decided to enter the admin panel, sprinkle some ban hammer goodness, and go back to sleep.

Then came the first surprise.

### WTH moment #1

I couldn't load the admin panel. Nothing was loading. Not even the simple `/health` endpoint. This was extremely strange, as Gunicorn + Uvicorn is a super stable combination and even previous spam attacks never really broke the site.

I was essentially mitigating while blind on my phone, as I had no access to the backend API panel.

I asked the community if there were any spam tasks before the site went down, and to my surprise, there were none. Nobody had spammed anything.

![](https://i.imgur.com/sfkKfoH.png)

This was different.

I began lifting the covers and turning on the lights (and coincidentally waking up my poor, poor fish).

### A reboot will do

I didn't suspect much yet, and I thought that perhaps the server bugged out. Maybe it was a memory leak.

I was waking up a little more, so I sat down on my bed and opened up JuiceSSH on my phone to try and make sense of the situation.

Makerlog runs on [Dokku](http://dokku.viewdocs.io/dokku/), so my first reaction was to reboot the affected app containers. The infrastructure is very neatly managed by Dokku's abstraction over Docker, so it was easy to prompt a clean reboot (ignore the errors, I was asleep!):

![](https://i.imgur.com/9o0IifU.png)

After a while, the containers rebooted. I was finally able to access the admin panel, and the attack was mitigated.

...sike.

It didn't work, and the problems continued. I proceeded to reboot the whole server, which didn't work either.

I opened the error logs to try and find any issues inside the containers. It was only showing a repeated stream of async/await coroutine errors, so I believed that was the problem.

![](https://i.imgur.com/hWa8ISp.png)

I restarted the containers several more times to get rid of my diagnosed process deadlock, to no avail.

![](https://i.imgur.com/fmR1kKM.png)

As Captain Sully said in his NTSB hearing... **It was time to get serious.**

### Errors, errors, and a sprinkle of eureka

Getting out of bed, I opened my laptop, hopped on SSH, and tried to figure out the problem.

I looked at the server log in disbelief. I had no idea what was going on.

After taking a look at the errors a few times, I concluded on _server error_. Makerlog runs on Uvicorn, which uses ASGI, so it is prone to bugs related to async/await. The error was about some coroutine thing, so I went down that path.

I began looking over the async code on the site, trying to find any errors. I surgically examined the WebSockets and database query code to no avail.

Then suddenly... I was reminded of a possibility I had completely forgotten.

**What if someone was pulling off a good ol' DDOS?**

![](https://i.imgur.com/SyxX3m9.png)

It wouldn't be a new thing. I've previously mitigated attacks related to people spamming the tasks endpoint. Makerlog, although it's around 2.3k members, is still a relatively small and lowkey service. I don't draw too much trouble.

### It was a DDoS

I was wrong. After taking a look at the Nginx logs, the situation was clear. A user was attacking our site and repeatedly pinging the `/products/` endpoint.

![](https://i.imgur.com/lEsbwgP.jpg)

The exploit was simple - due to legacy reasons, Makerlog's `/products/` API endpoint never really used pagination. Since launch, I never expected Makerlog to grow to its current size, so I never really bothered to add pagination.

Therefore, when requesting the endpoint, a massive SQL request would be made, freezing the server while the items were fetched + serialized into JSON (a Django REST Framework performance weak point).

It was perfect. Using this method, they could essentially max out the CPU and crash the entire server (which hosts other in-development apps too).

I focused on adding features and shiny new things rather than fixing fundamental parts of the service. Which is fine... Until they bite you back in the ass.

And today they did.

### Mitigation attempt #1: the ban hammer

So as any panicking citizen does when they receive a DDoS on their production server, I picked up the mighty ol' ban hammer, wielding its lightweight yet strong titanium alloy build and utilizing it to kick some ass.

I used Ol' Reliable and banned the offending IP addresses.

![](https://i.imgflip.com/2xmca3.jpg)

#### Verdict: didn't work

Wait a moment... That didn't work. I would still see requests from a couple of IPs I banned, even after checking UFW several times. The attack kept coming in. The nightmare didn't end.

![](https://i.imgur.com/6mnXdw5.png)

### Mitigation attempt #2: pushing hotfixes

After a bit more thinking, I figured that the best solution at this time was to stop the vulnerability in its tracks. Pushing a new API version with pagination enabled would essentially stop the endpoint from consuming so much CPU and defuse the attack, at the expense of a few broken API apps and the website products page not working.

So knowing it was an easy fix, I quickly patched up the Makerlog `/products/` endpoint, pushed to Dokku, and patiently waited for the deploy to finish.

![](https://i.imgur.com/wksJKdJ.jpg)

#### Verdict: it worked!

After this small change, the server's load reduced significantly and the site was momentarily back up.

![](https://i.imgur.com/OxHe4r0.jpg)

This victory would be short-lived, however.

### Mitigation attempt #3: Moving to CloudFlare

Simultaneously, I decided to try and move to CloudFlare after several recommendations from the community. The transition was quick and I was able to set the API to "Under Attack" mode to require challenge verification to suspicious addresses.

#### Verdict: it worked!

CloudFlare is a hard one to judge empirically, but from what I see in my analytics post-attack, I can say it definitely helped mitigate the attack and ease load on the server. Huge props to CloudFlare - your free plan is great!

![](https://i.imgur.com/rD7vKsC.png)

### Mitigated! We're safe! Right?

So the attack is now mitigated, things are fine... right?

No. After a while, I noticed something very interesting while watching the Nginx logs... They were getting nervous. They began crawling ALL API endpoints, looking for exploitable ones...

And they found one. The discussions endpoint suffered the same problem, but mitigating it (now that the cause was known) was easy. I pushed a hotfix and essentially the attack stopped.

![](https://i.imgur.com/JYKb6pm.jpg)

### Relief

The attacker gave up, and I could finally breathe.

In total, the attack lasted around 2 hours, from 3 AM to 5 AM my time.

## Why did this happen?

This whole problem was caused by my inexperience, really.

Makerlog, since the start, has been very open. The API has always welcomed all developers to build upon it, which has been a double-edged sword - in one hand, it created a passionate community of developers making awesome tools for Makerlog. In the other, it allowed for attacks like this to happen.

Makerlog, due to its nature of openness, relies heavily on trust upon its users and heavy moderation. I trust my users completely. It was not the first time someone actively exploited the API to cause harm, but it was the first real serious attempt at lasting damage.

**The trust factor wasn't the only cause. I was reluctant to fix these pagination issues because I prioritized direction and vision over improving the status quo.**

**I was wrong.**

With growth also come the assholes, and it's time to take another approach.

### Lessons learned

It's time for a new approach. Today, I took a few steps to mitigate these attacks in the future.

##### Things I will do/did:

1.  Prioritize bugfixes over new features.
2.  Implement new throttles & access-control features to prevent these attacks.
3.  Employ a new approach at API security, moving from the trust-first model into a precaution-first one.

##### Things I will NOT do:

1.  Lock down the API excessively - our dev community is very valuable!
2.  Handle these attacks lightly.
3.  Let the terrorists win!

Let's talk about a few of these items in detail.

##### Prioritizing bug fixes

Makerlog has been on a roll recently. I recently rolled out (ha) the Wellness update and we're literally in peak Makerlog.

However, I've taken an approach that I regret. I prioritized vision over fixing the status quo, and this has led to the attack taking place. I knew that this pagination issue was a problem, but I never patched it because I didn't consider it to be a big deal.

This is also a great moment to reiterate something important: **I always patch any outstanding bugs and exploits immediately** \- I value user trust and security too much to let anything terrible happen.

**There's never been any severe exploits on Makerlog - most have been access control problems (people editing other's tasks for example, haha). I can count them with one hand.**

**Your data is safe with me. I value your trust and privacy - let there be no doubt there.**

I apologize for this prioritizing problem, and I will make sure these things don't happen again.

##### Implementing access control features

As the user base and reach grows, so does the ratio of jerks to good people.

As stated earlier, Makerlog has always employed a trust-first model regarding API access. This excess user trust lends itself to abuse, and I will be switching to a "precaution-first" approach.

The dev community for Makerlog is amazing. New Makerlog integrations come out all the time, and it's my favorite thing to witness.

However, after this event, tighter controls will be implemented. I'm not locking down the API completely, but throttling and other precautionary measures will be in place to prevent these attacks from happening in the future.

## Thank you's!

A huge shoutout to friends like [James Ivings](https://twitter.com/jivings) and [Mubaris NK](https://twitter.com/mubaris_nk) for their help mitigating the attack and figuring out the root cause. And of course, another big thank you to the community for being so supportive even in rough times.

## Concluding

Last night I discovered there's jerks in the Internet.

I'm glad to say _we_ , as a community, conquered.

This is a lesson to be learned from. Let's take a negative event and turn it into a positive learning experience - because this is how people and companies evolve.

**Veni, vidi, vici.**
