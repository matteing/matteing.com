---
title: "A curious way to grab Screen Time data on iOS"
date: 2023-12-11T12:00:00
url: https://matteing.com/posts/a-curious-way-to-grab-screen-time-data-on-ios
slug: a-curious-way-to-grab-screen-time-data-on-ios
---

# A curious way to grab Screen Time data on iOS

If you're familiar with the Screen Time (DeviceActivity) APIs on iOS, you know how restrictive they are. Apple goes to great lengths to pull away usage data from you, even going as far as completely sandboxing the _views_ that even come close to touching it.

In [Device Activity Reports](https://developer.apple.com/documentation/deviceactivity/deviceactivityreportextension), the extension responsible for this, you can't do much other than display the data in marvelous(tm) ways:

> When you create a report, the system asks your app’s device activity report extension to provide a View representing the user’s device activity. To protect the user’s privacy, your extension runs in a sandbox. This sandbox prevents your extension from making network requests or moving sensitive content outside the extension’s address space.

This greatly limits you if you're building stuff with Screen Time. However, when I looked at apps on the store that try to gamify usage statistics ([Opal](https://opal.so) and [Jomo](https://jomo.so)), I'd notice they had features I thought impossible.

Leaderboards? How do you even _make_ leaderboards if this data is sandboxed? The screen time stat has to be arriving at a remote server _somehow_. Otherwise you wouldn't be able to see your friends' screen times. They either a) have entitlements from Apple, doubt, or b) figured out a way around the limitations in the API.

Turns out, the clue is in the screenshot. Notice how they say _estimate_? That's what led me to a curious rabbit hole on how to circumvent this (ridiculous) limitation...

**Note that everything here is authorized by the user, and you can only track what .familyActivityPicker returns. You must have the Family Controls entitlement from Apple to build with this!**

## A closer look

After a messing with the app for a couple of minutes, I arrived at a help article where they seem to explain what they do:

My first thoughts? This sounds about right. They're clearly not getting the actual screen time from the OS, Apple won't allow it. My suspicion is confirmed that they found another way to get it done.

The next curious clue: see how they mention it might differ by **5-10 minutes**? This got me thinking. It seemed arbitrary. By what mechanism would you be able to gather usage data and have a granularity of 5-10 minutes?

## What's available?

During the past week I've been exploring the APIs to figure out how to circumvent these limitations. One that stuck out to me was [DeviceActivityMonitor](https://developer.apple.com/documentation/deviceactivity/deviceactivitymonitor). It seems like the most _logical_ next step, but I was unsure how to get it done.

My initial stumbles with it were mostly about my preconception about how that API is supposed to be used. It's meant for setting up blocks after a specific usage threshold is met. It's intended for apps which serve as parental controls: e.g. the app receives an event after an app has been used more than a threshold, and based on this event can set up an app block.

In essence: DeviceActivityMonitor tells the system to send you events when a specific usage threshold is met, with regards to a specific category/set of apps on the device.

## The moment I realized

Oh shoot. They're not using DeviceActivityMonitor itself to _track_ how much time is being spent on the device: it generates no data that way. They're using it to _alert the app_ every X minutes you spend on activities being tracked (the usage "threshold").

Think about it: if you set up a monitoring interval between 0:00 -> 1:59, and thresholds for every 5 minutes within that timespan:

$$\frac{60\text{ mins}}{5\text{ mins}} = 12 \text{ thresholds} \rarr[5, 10, 15, ...]$$

The system will notify you at each threshold step.

With some clever setup, you can create a monitoring activity that has thresholds configured every 5 minutes between an interval of X hours. Just count how many times that 5 minute threshold has been called, and you have an overall estimate of how much the user has used the device.

## The setup

We need to create two things.

1.  Monitoring Activities/Schedules: these define the monitoring intervals
2.  Monitoring Events: these define the thresholds to monitor, and the apps/categories/etc to watch over

This is what activities & schedules look like:

```swift
// Note each activity name must be unique
// The ActivityName allows your extension to identify what the call is about
let activity = DeviceActivityName("satellite.monitor.\(uniqueId)")
let schedule = DeviceActivitySchedule(
  intervalStart: startTime,
  intervalEnd: endTime,
  repeats: true
)
```

Each activity has a set of _events_ that it can track within their interval. These events consist of the thresholds we've mentioned before.

```swift
let minute = 5; // Whatever minute the event is assigned to
let eventName = DeviceActivityEvent.Name("satellite.monitor.\(minute).thresholdReach")
let event = DeviceActivityEvent(
	// Get tokens from the .familyActivityPicker() view
  applications: selection.applicationTokens,
  categories: selection.categoryTokens,
  webDomains: selection.webDomainTokens,
  // Our sweetheart is here
  threshold: DateComponents(minute: minute)
)
```

iOS allows you to register 20-21 monitoring activities _at most_ before throwing errors. So the first limitation we face is that we can't do the immediately obvious scheme of 24 one-hour-long schedules, with 5 minute threshold intervals.

$$\frac{2 \times 60\text{ mins}}{5\text{ mins}} =24 \text{ thresholds} \rarr[5, 10, 15, ...]$$

Ultimately this works out to:

$$\frac{1440 \text{ mins per day}}{5\text{ mins}} = 288 \text{ thresholds}$$

And _in theory_ , if we $\times 5$ the amount of times an event fires, we should be able to get a close estimate of the user's Screen Time.

## The View

First, this assumes you've set up a DeviceActivityMonitor extension target in Xcode. [I've written an article on this, go check that out!](https://matteing.com/posts/using-screen-time-apis-in-ios)

First, use the Family Activity Picker to ask the user which activities they'd like to track:

```swift
import FamilyControls

struct ContentView: View {
	@State private var pickerIsPresented = false
	@State private var activitySelection = FamilyActivitySelection(includeEntireCategory: true)



	var body: some View {
		Button {
      pickerIsPresented = true
    } label: {
      Text("Select Apps")
    }
    .familyActivityPicker(
      isPresented: $pickerIsPresented,
      selection: $activitySelection
    )
	}
}
```

Once we've got that selection, we go ahead and trigger an onChange action that sets up the schedules. With the help of a helper function (heh), we can get the 12 intervals for all hours in the day:

```swift
func generateHourlyDateTuples() -> [(DateComponents, DateComponents)] {
  let calendar = Calendar.current
  let startDate = calendar.date(bySettingHour: 0, minute: 0, second: 0, of: Date())!

  var hourlyDateTuples: [(DateComponents, DateComponents)] = []

  for hour in stride(from: 0, through: 23, by: 2) {
    let startHourDate = calendar.date(byAdding: .hour, value: hour, to: startDate)!
    let endHourDate = calendar.date(byAdding: .hour, value: 2, to: startHourDate)!.addingTimeInterval(-1)

    let startComponents = calendar.dateComponents([.hour, .minute, .second], from: startHourDate)
    let endComponents = calendar.dateComponents([.hour, .minute, .second], from: endHourDate)

    hourlyDateTuples.append((startComponents, endComponents))
  }

  return hourlyDateTuples
}
```

Now we set up the schedules & events:

```swift
.onChange(of: activitySelection, initial: false) { oldSelection, selection in
  Task {
    if !selection.applicationTokens.isEmpty {
      // Stop any ongoing monitoring
      center.stopMonitoring()

      let intervals = generateHourlyDateTuples();
      // Set up the events list.
      // All event names should be unique, but they can be shared between schedules.
      var events: [DeviceActivityEvent.Name: DeviceActivityEvent] = [:]
      // 2 hours = 120 minutes
      // Start from 5 minutes elapsed, all the way until 115
      for minute in stride(from: 5, through: 115, by: 5) {
        let eventName = DeviceActivityEvent.Name("event.\(minute).thresholdReach")
        events[eventName] = DeviceActivityEvent(
          applications: selection.applicationTokens,
          categories: selection.categoryTokens,
          webDomains: selection.webDomainTokens,
          threshold: DateComponents(minute: minute)
        )
      }

      // Register the schedules.
      for (index, (startTime, endTime)) in intervals.enumerated() {
        let schedule = DeviceActivitySchedule(
          intervalStart: startTime,
          intervalEnd: endTime,
          repeats: true
        )
        let activity = DeviceActivityName("schedule.\(index)")
        do {
          try center.startMonitoring(activity, during: schedule, events: events)
          print("Started monitoring for interval \(index), \(events.count) events")
        } catch {
          print("Error starting monitoring: \(error)")
        }
      }
    }
  }
}
```

That's all for our view.

## The Extension

This is the simplest part! Just hook it up to however you want to track the events.

```swift
import DeviceActivity
import Foundation
import UserNotifications

// Optionally override any of the functions below.
// Make sure that your class name matches the NSExtensionPrincipalClass in your Info.plist.
class DeviceActivityMonitorExtension: DeviceActivityMonitor {
  override func intervalDidStart(for activity: DeviceActivityName) {
    super.intervalDidStart(for: activity)
    print("Tracking start \(activity.rawValue)")
  }

  override func intervalDidEnd(for activity: DeviceActivityName) {
    super.intervalDidEnd(for: activity)
    // TODO: Figure out if this triggers regardless of use?
    minsUsed += 5
  }

  override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
    super.eventDidReachThreshold(event, activity: activity)
    print("track.minutesSpent:5 [\(event.rawValue)]")
    // You can use the EventName to figure out what thresold triggered it
    minsUsed += 5
  }
}
```

Make sure to go through [DeviceActivityMonitor's](https://developer.apple.com/documentation/deviceactivity/deviceactivitymonitor) documentation to make sure you understand what causes events to get triggered. It's important to know the limitations of this approach!

That's about it.

## Notes

1.  Last 5 minutes of an interval are unclear to me. Perhaps setting final threshold does something? My understanding is that intervalDidEnd triggers regardless of whether the user used the app during those final minutes, therefore could be unreliable.
2.  Registering the activities is slow, and might need to be offloaded to a background task.
3.  Drawback: you can only monitor 20 schedules at a time. So if you're thinking that you can granularly monitor multiple familyActivityPicker results, that limitation will bite.

## Closing

Great! Now you have a Screen Time number that you can do anything with, without dumb limitations. It's not extremely accurate, and you won't get historical data, but it works well enough. Most importantly, it's all user-controlled: the Activity Picker lets them choose what to or not track.

Note that I don't know much about Swift/SwiftUI/iOS app development. It's my first two weeks messing around, and I will most definitely be wrong somewhere.

If you see anything sketchy in this article, [please let me know](https://twitter.com/matteing)!

That's all for today! I hope you learned something. I sure did!
