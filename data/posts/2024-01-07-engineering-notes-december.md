---
title: "December notes (HealthKit, Postgres, more!)"
date: 2024-01-07T12:00:00
url: https://matteing.com/posts/engineering-notes-december
slug: engineering-notes-december
---

# December notes (HealthKit, Postgres, more!)

Hi friends! It's been a couple weeks since I last shared any engineering notes on my blog. I've been silently building, but it's about time I share some of my learnings. Here's what's on my mind lately!

## Optimal sampling for HealthKit data

My latest project, Timeline, constantly gathers data about me and my health. It tracks how many steps I take, how much food I eat (and the particular macros associated with the food items). It tracks my sleep cycles using my Apple Watch. It's my personal, private database.

A big point of difficulty for me, though, has been figuring out how to optimally store and query the data I'm generating and storing. I've tried multiple approaches, each with their downsides and difficulties. Here are some interesting problems I've solved so far, and unsolved ones as well.

### Deduping

If you're using HealthKit observers or anchored queries, be prepared to receive multiple events firing for the same `HKSample`. On the server side, you must deduplicate these events using the sample's unique UUID.

### Staying close to the parent API

Something that's greatly helped with reducing complexity and friction while bringing up Timeline has been making sure that my backend code looks as _similar as possible_ to the underlying APIs that they query. This keeps the mental overhead of integrating many services at a minimum.

Sometimes, it's even more _convenient_ because the engineers behind these APIs have faced the problems you haven't yet. In the case of integrating with HealthKit, keeping the server-side database design as close to the on-device store has been helpful in taking advantage of these lessons.

A curious example is bedtime analysis data. HealthKit stores samples of when you started a particular phase of sleep, and when it ended. This is represented in the HKSample class by `startDate` and `endDate`. When I implemented this feature, I added those two fields to the database structure for the sleep table.

Related to this, a curious lesson arrived when fixing a bug in my caloric intake feature. While in the above image the table has `startedAt` and `endedAt`, it wasn't always like this. In a previous iteration, I used `insertedAt` as the effective timestamp for the sample data, assuming HealthKit will keep getting new samples as time goes on. The problem came when I realized I forgot to account for _editing_ previous health samples, something that fitness apps do constantly.

HealthKit could send me an edit event for a sample I'd never seen before, perhaps a day or two old. In the previous design, the database, this would work as an "upsert": find by UUID and update the sample. However, how about the "-sert" part of the word? If the edit event didn't have a corresponding sample in the database, a new entry would be inserted with `insertedAt` as _right now_. That's wrong. Yikes.

In that case, I decided to follow the guiding principle: _stay close to the integrated API_. Turns out HealthKit uses both `startDate` and `endDate`as the date fields for all types of samples, even if they're not time ranges I knew this would be more difficult to query, but it's a much better solution than what I have now and it would fix my problem.

I went with that. It's been fine.

### To aggregate or not aggregate?

The biggest decision I had to make was whether to store aggregated cumulative sum values or the _raw sample data_ as stored in HealthKit.

Raw sample data could look something like this:

```
Sample 1: 33 kcal (now)
Sample 2: 44 kcal (1 minute ago)
Sample 3: 44 kcal (3 minutes ago)
```

To get a caloric intake value you'd run a cumulative sum aggregation over this raw sample data for the current day (adjusted for whatever timezone). Mouthful, I know.

Locally-aggregated data would look like this:

```
Sample 1: 121 kcal (now)
Sample 2: 88 kcal (1 minute ago)
Sample 3: 44 kcal (3 minutes ago)
```

It's easy to parse. It stores the current value for what we want, precomputed. To query this, get the latest entry for the current day. [Easy](https://www.youtube.com/watch?v=NL3gWsg0RPQ), right?

Grabbing aggregated data was simple too on the iOS side. Set up an `HKStatisticsQuery` to get a cumulative sum value, and tell the server the latest value when HealthKit changed. Ezpz.

On the other hand, it becomes impossible to edit or update anything. Your samples are assumed to be a continuous line. How do you even manage to edit a particular sample value in a point in time, accurately? Plus you miss all the data analysis benefits of storing the raw sample values. Storage size isn't a problem, we're in 2023, I can afford to have a lot of data.

This debate comes with its database design challenges, which is something I'm honestly fighting with at this moment. Notice I didn't go deep there–it's not my area of expertise and I'm trusting I'll figure it out along the way. Inevitably I'll find problems with it, but it's never too late to change the database design.

## Observing for HealthKit changes in the background

Quick pro-tip: if you're looking to observe new/deleted/edited samples in the background, this is for you. You must use a combination of HKObserverQuery and HKAnchoredQuery to get sample data immediately.

The outer observer query, which should be called in your AppDelegate:

```swift
func beginObserveSampleTypes() {
  let trackedTypes = [
    dietaryEnergyConsumedType
  ]

  let trackedDescriptors = trackedTypes.map { HKQueryDescriptor(sampleType: $0, predicate: nil) };

  let query = HKObserverQuery(queryDescriptors: trackedDescriptors) { (query, updatedSampleTypes, completionHandler, errorOrNil) in
    Self.logger.info("Beginning observer run.")
    guard errorOrNil == nil else {
      // Handle the error
      Self.logger.info("Observer failed with error: \(errorOrNil!.localizedDescription)")
      completionHandler()
      return
    }

    // Only query updated sample types.
    guard let types = updatedSampleTypes, !types.isEmpty else {
      Self.logger.warning("No updated types. Early return.")
      completionHandler()
      return
    }

    self.innerQuery()


    // Important!
    completionHandler()
  }

  for quantityType in trackedTypes {
    healthStore.enableBackgroundDelivery(for: quantityType, frequency: .immediate) { (success, error) in
      if let unwrappedError = error {
        Self.logger.warning("Could not enable background delivery: \(quantityType), \(unwrappedError)")
      }
    }
  }

  healthStore.execute(query)
}
```

Observer queries only tell you what sample types changed, not the rows themselves that did. Once an update occurs, an inner query must be executed to get the changes.

```swift
func innerQuery() {
  let anchorKey = "calorie-intake-anchor"
  let initialAnchor = NutritionWatcher.getAnchorKey(keyName: anchorKey)
  let query = HKAnchoredObjectQuery(
    type: dietaryEnergyConsumedType,
    predicate: nil,
    anchor: initialAnchor,
    limit: 50,
    resultsHandler: {
      (q, samplesOrNil, deletedObjectsOrNil, newAnchor, errorOrNil) in
      guard let samples = samplesOrNil as? [HKQuantitySample] else {
        // Properly handle the error.
        print("no samples")
        return
      }

      NutritionWatcher.setAnchorKey(keyName: anchorKey, newValue: newAnchor)

      if samples.isEmpty {
        print("No samples returned.")
        return
      }

      // Do whatever!
    })
  healthStore.execute(query)
}
```

That should work. Note that you must refine the predicate for both queries to your use case, otherwise you may get a huge flow of unwanted samples. In my case, I ignore the first run influx and listen for updates instead. This allows me to update historical data for longer time periods on my backend side.
