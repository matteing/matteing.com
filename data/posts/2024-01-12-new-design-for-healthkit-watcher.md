---
title: "New design for HealthKit watcher"
date: 2024-01-12T12:00:00
url: https://matteing.com/posts/new-design-for-healthkit-watcher
slug: new-design-for-healthkit-watcher
---

# New design for HealthKit watcher

The final design for the HealthKit watcher consists of a two-tiered solution. Let's go through it from outermost to innermost.

**Definition: Observed quantity types**

```swift
func getTrackedTypes() -> [HKSampleType] {
  return [
    dietaryEnergyConsumedType,
    appleExerciseTimeType,
    dietaryProteinType,
    stepCountType,
    sleepAnalysisType
  ]
}
```

**Tier 1: Observer query**

This query gives us a nudge when something changes in the HealthKit store. It doesn't tell us which samples were added/removed/modified, we must execute an inner query to get them.

```swift
func beginObserveSampleTypes() {
  let trackedTypes = getTrackedTypes()
  let trackedDescriptors = trackedTypes.map { HKQueryDescriptor(sampleType: $0, predicate: nil) };

  let query = HKObserverQuery(queryDescriptors: trackedDescriptors) { (query, updatedSampleTypes, completionHandler, errorOrNil) in
    // ... validations ...

    self.executeAnchoredQueryForSampleTypes()

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

**Tier 2: Anchored query**

Anchored queries allow, as the name mentions, getting an "anchor" that can be later used to retrieve only changed samples since that point. This is where the magic happens.

```swift
func executeAnchoredQueryForSampleTypes() {
  let trackedTypes = getTrackedTypes()
  let trackedDescriptors = trackedTypes.map { HKQueryDescriptor(sampleType: $0, predicate: nil) }

  // primitively invalidate if trackedTypes changes
  let anchorKey = "sample-types-query-\(trackedTypes.count)"
  let anchor = AnchorManager.getAnchor(forKey: anchorKey)

  let query = HKAnchoredObjectQuery(
    queryDescriptors: trackedDescriptors,
    anchor: anchor,
    limit: HKObjectQueryNoLimit
  ) {
    (q, samplesOrNil, deletedObjectsOrNil, newAnchor, errorOrNil) in
    AnchorManager.setAnchor(forKey: anchorKey, anchor: newAnchor)

    guard let samples = samplesOrNil else {
      print("Error received when getting samples.")
      return
    }

    if anchor == nil {
      print("Skipping initial run.")
      return
    }

    print("Samples received: \(samples.count)")
    self.handleSamples(samples: samples)
  }

  healthStore.execute(query)
}
```

**Tier 3: Sample handling**

Define a function that switches on the `HKSample` type, then on individual measurements.

```swift
func handleSamples(samples: [HKSample]) {
  for sample in samples {
    if let sample = sample as? HKQuantitySample,
       let sampleValue = getQuantitySampleValue(sample: sample) {
      switch sample.quantityType {
      case dietaryEnergyConsumedType:
        Self.logger.info("Received dietary consumed: \(sampleValue) kcal")
        break
      case appleExerciseTimeType:
        Self.logger.info("Received exercise time: \(sampleValue) min")
        break
      case dietaryProteinType:
        Self.logger.info("Received dietary protein: \(sampleValue) g")
        break
      case stepCountType:
        Self.logger.info("Received step count: \(sampleValue) steps")
        break
      default:
        print("Nothing to do.")
        break
      }
    } else if let sample = sample as? HKCategorySample {
      switch sample.categoryType {
      case sleepAnalysisType:
        self.getSleepAnalysis()
        break;
      default:
        print("Nothing to do.")
        break
      }
    }
  }
}
```

## Problems?

The biggest problem I've faced is that anchors are finicky. Sometimes they don't get saved properly to UserDefaults. Reducing the usage of anchors helped solved this problem, hence why there's one anchored query only.

## Song?
