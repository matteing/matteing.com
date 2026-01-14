---
title: "Storing anchors for HKAnchoredObjectQuery (and other fun stuff)"
date: 2023-12-31T12:00:00
url: https://matteing.com/posts/storing-anchors-for-hkanchoredobjectquery-and-other-fun-stuff
slug: storing-anchors-for-hkanchoredobjectquery-and-other-fun-stuff
---

# Storing anchors for HKAnchoredObjectQuery (and other fun stuff)

Lately I'm building a project called [Timeline](https://my.timeline.matteing.com), which aims to be a centralized source of truth for absolutely _everything_ that I do in my life. It's a reincarnation of the Quantified Self movement of the early 2010s, but with _way_ more polish and less geekiness. It's like Makerlog but less about _making_ and more about improving myself and my lifestyle.

Timeline aggregates data about my health, the music I listen to, how productive I am and more. The bigger picture is that this serves as a back-end for tons of cool things, like a relevance engine (what's most relevant to me right now?), correlations engine (what most affects my mood for example) and a... get this... clock.

Seriously, a clock. Like the ones that tell time. It's actually the main driver for why I'm building Timeline. It sounds _ridiculous_ , but I promise that once the bigger picture is more formalized it'll all make sense. The flip side is that it's a _ginormously ambitious_ project, with apps and integrations across platforms.

Eventually it'll become public. I'll start blogging about my progress building it. The goal is to get to a straight month of data collection, then I'll start building the sexy UI parts. Everything in due time.

This all exists, and people are doing it. But they're cobbling together awkward solutions, and they're u.g.l.y. I love sexy products. I love refined experiences. And that's what I'm building for Timeline.

## All that blurb aside

To gather data in HealthKit, you must occasionally execute `HKAnchoredObjectQuery`, which allow you to query for the _changes_ between a particular point in time (the anchor) and now.

However, being a Swift newbie, I didn't know how to store the anchor permanently in my app for future use.

This snippet will help:

```swift
func getAnchorKey(keyName: String) -> HKQueryAnchor? {
  guard let anchorData = UserDefaults.standard.data(forKey: keyName) else {
    return nil
  }
  return try? NSKeyedUnarchiver.unarchivedObject(ofClass: HKQueryAnchor.self, from: anchorData)
}

func setAnchorKey(keyName: String, newValue: HKQueryAnchor?) {
  guard let newValue = newValue else {
    UserDefaults.standard.set(nil, forKey: keyName)
    return
  }
  if let anchorData = try? NSKeyedArchiver.archivedData(withRootObject: newValue, requiringSecureCoding: true) {
    UserDefaults.standard.set(anchorData, forKey: keyName)
  }
}
```

That's all. Use those two functions to get and set your anchors. Your anchored queries now work.

Something curious that _may_ or may not apply to you: sometimes it's better to use a cumulative sum `HKStatisticsCollectionQuery`. I was originally using `HKObserverQuery` to upload the kilocalorie difference between the previous value and adding a new item to today's food log. This quickly proved to be a stupid idea: instead, I ended up going with sampling the cumulative sum of that particular statistic when `HKObserverQuery` wakes up the app.

It looks like this:

```swift
let query = HKObserverQuery(queryDescriptors: trackedDescriptors) { (query, updatedSampleTypes, completionHandler, errorOrNil) in
  guard errorOrNil == nil else {
    // Handle the error
    completionHandler()
    return
  }

  // Only query updated sample types.
  guard let types = updatedSampleTypes, !types.isEmpty else {
    // No updated types. Early return.
    completionHandler()
    return
  }

  for type in types {
    switch type {
    case self.dietaryEnergyConsumedType:
      self.grabCumulativeQuantitySample(quantityType: type as! HKQuantityType)
      break
    case self.appleExerciseTimeType:
      self.grabCumulativeQuantitySample(quantityType: type as! HKQuantityType)
      break
    default:
      print("No match for type")
      break
    }
  }

  // Important!
  completionHandler()
}
```

Sampling is a better approach. It's simpler for us to execute on the phone end. It does complicate things when building series queries with Postgres but we can optimize for this later.

HealthKit has support for background deliveries of relevant statistic updates. It wakes up the app when something in the health store changes. However, it's absolutely useless for anything mission critical–sometimes updates just don't deliver at all.

Like anything background-related in iOS, it's a huge pain in the ass for reliability. I was thinking perhaps a Home Screen widget would keep the app awake somehow as I've seen other apps do this. But I digress.

Somehow this straightforward anchoring tutorial turned into an engineering brain dump. Thanks for reading.

[GitHub](https://github.com/matteing)[Twitter](https://twitter.com/matteing)[Instagram](https://instagram.com/matteing)[RSS](/rss)
