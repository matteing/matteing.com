---
title: "How I shipped a SaaS during Hurricane Maria"
date: 2019-12-11T12:00:00
url: https://matteing.com/posts/how-i-shipped-a-saas-during-hurricane-maria
slug: how-i-shipped-a-saas-during-hurricane-maria
---

# How I shipped a SaaS during Hurricane Maria

_This is a post from 2018 I decided to move over to my blog. Enjoy!_

This is naturally a difficult story to tell. It involves two very hard things for me, the passing of Hurricane María and the shutdown of a previous startup. But I’m wishing to tell my story, so others can learn and be inspired by it.

### The calm

_I decided to include what I felt, for context._

September 16, 2017. Caguas, Puerto Rico.

You would’ve thought it was a normal day, until you looked at the TV monitors and noticed the panic that was going on.

The weather was eerily calm. I remember helping my Dad put on the storm windows, still not understanding exactly the severity of the situation. My generation had never experienced a hurricane before. I must admit, I was curious. I wanted to understand what the panic was about. Everything looked normal.

I took my external HDD and began backing up Taleship’s files, SSH keys, and more. The past few months had been excellent for Taleship. User growth was steady, and I was in the process of creating Taleship for Education, which promised to provide a source of revenue for the budding startup.

As my dad and I hit the freeway to get supplies and visit relatives, he said something rather striking:

> **Take pictures of everything you see now.**

In the car, I laughed slightly. I didn’t take any pictures. I brushed it off as an exaggeration, something nonsensical, irrational. I thought it wouldn’t be “that bad”.

**He was right.**

### The morning after

After a sleepless night and nerve-wracking morning, the winds finally slowed down enough to be able to safely peek outside and assess the damages.

**Everything was destroyed. Poles in the floor, debris everywhere.**

Like straight out of a nightmare.

### The first few weeks

The following first weeks were a textbook apocalypse. We rationed food, water, and fuel. In this period of time, I never truly thought once about my products, as I was trying to rationalize and accept what just happened, and cope with the survival instinct kicking in.

After a while, I was able to power on my laptop for the first time. This is where I began to think about my products again, as the initial shock and emotion subsided, and internet access started to become sporadically available utilizing my phone’s hotspot.

**I immediately released a statement on Taleship’s blog explaining the situation and what measures I would take from this point forward, but internally, I had no idea what to do.**

Internet access was slow, I only had a budget laptop to develop on, and my emotional state wasn’t helping.

However, I realized it all depended on me. I picked myself up, and decided to do a simple thing: just ship. At night, when there was nothing left to do, I picked up my charged laptop and built Taleship 2.0 in _pitch darkness_ until its battery died.

**I took these difficult moments to better myself and my startup.**

Because I only had two options; to wallow in it, or to get the most out of a bad situation. I picked the latter, and you should too.

#### **What I learned**

Don’t wallow in the face of a bad situation. Positivity, always.

### The business aspect

I utilized this time to reflect on the future of my startup, and plan out exactly how it would recover from this devastating blow. With most if not all local schools operating with diesel power, who would invest or buy any service from my SaaS?

I had proposals ready, but who would accept them?

This mindset was the biggest hurdle. I continued developing the software, but I had no idea where I was taking it.

To be completely honest, I didn’t recover from this one. Taleship shut down due to lack of motivation and dwindling interest from the education sector after the hurricane.

However, I did learn some lessons from this. I kept my network close and posted on the startup’s situation, and their support greatly helped me.

As an extra note, I was aware that several coworking spaces were beginning to open and were offering free space with high-speed internet for startups. If in an emergency situation, try to find places to relocate your startup — there’s always small spots with internet access that open up to take visitors.

#### **What I learned**

Keep your network close, and assess your options. Begin working on a recovery plan as soon as possible. And, as stated before, don’t let the negativity consume you. It will be the death of your startup.

### The emotional aspect

**There’s a moment I won’t ever forget. One that marked me forever.**

I remember turning on the radio with my family nearby, while the winds were still raging outside. It was morning.

Only one radio station was still transmitting. We tuned in, and started listening to the calls they were taking in.

This experience marked me — and, in a way, our country, as a whole.

One call I especially remember was someone narrating how their house was flooding completely and they needed help stat. This one hit me hard — imagine your home flooding. Everything you own. And feeling completely helpless about it.

Then the other calls were mostly a stream of international callers checking in, trying to contact their family members.

**It was truly a hard listen. One of the hardest of my life. I’m having a hard time even writing this.**

All in all, you’ll be bombarded with experiences like this, because it’s reality. It’s happening in your country. Your people are suffering this. So naturally, it won’t help your emotions very much!

At first you may feel fine. You’ll be fine until reality kicks in. The first week or so, I felt alright, mostly because I had not realized the scale yet. It will take time to rationalize what’s going on.

Here’s a few tips to help you continue on.

#### Sergio’s Hurricane Emotional Checklist

1.  **Take a break.** Don’t continue with the grind mentality. With the recovery work you’ll be involved in ( finding gas, etc), you’ll have enough on your plate. Put yourself first in this time.
2.  **Engage in recovery work.** Don’t stay at home. It’ll make you more depressed — go out there, join citizens and recovery workers picking up debris and help them out! It’s great because it helps the country recover and keeps you from overthinking things.
3.  **Listen to music and read books.** I’ll go more in-depth about this later, you’ll need it.
4.  **Keep a positive outlook.** I know it’s hard to stay positive after things of this scale happen, but try! It’s up to you whether you let it destroy you or use it as a learning experience.

### The development aspect

Developing after the hurricane was difficult, but possible.

**The biggest hurdle I encountered was slow, sporadic internet access.** Due to the lack of power, cable provider internet was not an option. The only way of accessing the web was through my phone’s hotspot, and signal was spotty at best, even a month after day zero.

#### Sergio’s Hurricane Preparation Checklist:

1.  **Documentation** : I downloaded docs using Zeal, the Linux equivalent for DashDocs.
2.  **External assets** : Web developers, download a copy of libraries and fonts your product uses.
3.  **Music** : Keeps you sane. Really, it does.

I’ll go through each item on the list to explain the importance of each.

#### Documentation

I cannot stress this one enough. Keep a copy of the docs for your stack! I had a bit saved from before the hurricane, and that saved my butt.

There’s many apps that allow you to do this — Back then I used Zeal for Linux, but Dash is a great one for macOS (which I switched to).

> **Imagine waiting 5 minutes to load up StackOverflow.**

You won’t have StackOverflow, but you will have piles of documentation to search through. I definitely came out a better developer after this hurricane.

#### External assets

This one is also _absolutely_ _urgent_.

When turning on my development server to code, the first problem I faced was that Taleship relied on _a lot_ of external assets.

These were not stored or cached in my laptop, and made loading the app _extremely slow._ After an hour or so, I managed to download all failing assets, but it was still a pain.

**Don’t rely too much on CDNs. They break during the apocalypse.**

#### Music

**Always keep a little bit of music saved somewhere.** Spotify and Apple Music didn’t work, but I had a few albums saved on my external drive.

Don’t even think of downloading some music at the time — I tried that, and quit when I realized a 2MB song would take about 5–8 minutes to download.

A little Radiohead at the end of the day really helps keep the apocalypse stress away. And don’t forget some Lady Gaga when you start picking up debris — it’s much less of a chore when you’re singing _Bad Romance_.

#### **What I learned**

Keep copies of everything you frequently access. Documentation and external assets are a must, too.

### Almost a year later

Well, it’s been quite a while since the hurricane struck.

I’m totally fine now. I like to think I came out a better human from this whole ordeal. I didn’t go to school for a month or so, and when I wasn’t doing recovery chores, I was reading, coding, and in general bettering myself. On another note, Taleship didn’t work out, but I learned quite a lot from it.

Nowadays, I’m shipping a product called [Makerlog](http://getmakerlog.com), a productivity tool for makers. You should check it out, by the way.

### Final thoughts

The island is still recovering from the hurricane’s ruthless strike, but life is mostly back to normal. Our resilience and unity got us through this mess, and in a sense, made us all better people.

I still remember what I felt when I saw everyone together clearing roads and picking up debris.

I felt hope. Hope that in the face of adversity, we would rise.

And we did.
