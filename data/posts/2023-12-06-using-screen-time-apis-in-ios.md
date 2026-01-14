---
title: "Using the Screen Time APIs in iOS"
date: 2023-12-06T12:00:00
url: https://matteing.com/posts/using-screen-time-apis-in-ios
slug: using-screen-time-apis-in-ios
---

# Using the Screen Time APIs in iOS

Here's the deal: lately I've been messing with the Screen Time API for an app I'm building in iOS.

It's the worst possible introduction to Swift & iOS development! Somehow I managed to choose the _least_ documented API to start my iOS journey. It requires adding capabilities, multiple processes, extensions... As a total absolute newbie to Swift, this was impossible for me to figure out, and it took days.

Here's how I went from zero to "triggering a notification from the DeviceActivityMonitor extension".

Note that I know _nothing_ about Swift. I'm just starting out now, but I struggled so much with this process that I figured it'd be worth sharing my notes in case someone else was going through this.

## Step 1: Start a new Xcode project

To play around with these APIs, it's imperative to start a new project to mess around with.

In my case, this was my first ever project, and it took a couple of disasters to finally arrive at a Xcode project I wouldn't destroy.

## Step 2: Add the Family Controls capability

This requires an entitlement from Apple, but we'll pretend we have it for now, by manually modifying the plist that enables it.

1.  Click on your app's name with the yellow icon.
2.  Click on the plus symbol next to "Entitlements".
3.  Write "Family Controls" on the left, then "YES" on the right.

## Step 3: Add the App Groups capability

This is required, since App Extensions run on a separate process. [This post in particular _saved my ass_ colossally.](https://stackoverflow.com/questions/75554119/deviceactivitymonitor-extension-methods-not-being-triggered)

## Step 4: Add the extension target

I didn't know how to add an extension--I thought it was just a random file you drop into your folder at first. No wonder I was wondering how they even worked!

No: turns out you need to add something called a _target_ to your repository. It helpfully has a template for the extension we need.

## Step 5: Add the permission prompt

Now, we need a permission prompt to request the Screen Time permission:

```swift
// Import the FamilyControls framework
import FamilyControls

// Top-level initialize the AuthorizationCenter
let ac = AuthorizationCenter.shared

// In your view code...
Button {
  Task {
    do {
      try await ac.requestAuthorization(for: .individual)
      print("Authorized")
    }
    catch {
      print("Failed")
    }
  }
} label: {
  Text("Request permission")
}
```

## Step 6: Add the activity selection prompt

Next up, we need to let the user select which categories they want to monitor.

Add a model to store this state:

```swift
import Foundation
import FamilyControls

class ScreenTimeSelectAppsModel: ObservableObject {
  @Published var activitySelection = FamilyActivitySelection()

  init() { }
}
```

Then, wire the prompt to this model:

```swift
// Top level of the view
@ObservedObject var model: ScreenTimeSelectAppsModel
var center: DeviceActivityCenter = DeviceActivityCenter()

// In the view code
Button {
  pickerIsPresented = true
} label: {
  Text("Select Apps")
}
.familyActivityPicker(
  isPresented: $pickerIsPresented,
  selection: $model.activitySelection
)
```

## Step 8: Start the monitoring activity

If the monitoring selection state changes, start monitoring.

```swift
.onChange(of: model.activitySelection) {
  let selection = model.activitySelection;
  let schedule = DeviceActivitySchedule(
    intervalStart: DateComponents(hour: 0, minute: 0, second: 0),
    intervalEnd: DateComponents(hour: 23, minute: 59, second: 59),
    repeats: true
  );

  let event = DeviceActivityEvent(
    applications: selection.applicationTokens,
    categories: selection.categoryTokens,
    webDomains: selection.webDomainTokens,
    threshold: DateComponents(minute: 10)
  )

  do {
    if (!selection.categoryTokens.isEmpty) {
      center.stopMonitoring()
      let activity = DeviceActivityName("satellite2App.ScreenTime")
      let eventName = DeviceActivityEvent.Name("satellite2App.SomeEventName")

      try center.startMonitoring(
        activity,
        during: schedule,
        events: [
          eventName: event
        ]
      )
      print("Sent monitoring call")
    }
  } catch {
    print("Failed somewhere")
  }
}
```

## Step 7: Send yourself a tracking notification

If you write a "print()" inside the extension itself to try and debug it, you won't get too far. It's running in a separate process: a more productive approach is to send a notification from that process instead to test that it's working.

My extension code looks like this:

```swift
import DeviceActivity
import UserNotifications
import os

// Optionally override any of the functions below.
// Make sure that your class name matches the NSExtensionPrincipalClass in your Info.plist.
class DeviceActivityMonitorExtension: DeviceActivityMonitor {
  var logger: Logger = Logger()

  func scheduleNotification(with title: String) {
    let center = UNUserNotificationCenter.current()
    center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
      if granted {
        let content = UNMutableNotificationContent()
        content.title = title // Using the custom title here
        content.body = "Here is the body text of the notification."
        content.sound = UNNotificationSound.default

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false) // 5 seconds from now

        let request = UNNotificationRequest(identifier: "MyNotification", content: content, trigger: trigger)

        center.add(request) { error in
          if let error = error {
            print("Error scheduling notification: \(error)")
          }
        }
      } else {
        print("Permission denied. \(error?.localizedDescription ?? "")")
      }
    }
  }

  override func intervalDidStart(for activity: DeviceActivityName) {
    super.intervalDidStart(for: activity)
    scheduleNotification(with: "interval did start")
    // Handle the start of the interval.
  }
}
```

## Step 8: Profit?

Well, now I've got somewhere. I gotta keep swimming and figuring out the rest, but this makes me confident that I can get that done.

Useful resources that contributed to this:

- <https://crunchybagel.com/monitoring-app-usage-using-the-screen-time-api/>
- <https://stackoverflow.com/questions/75554119/deviceactivitymonitor-extension-methods-not-being-triggered>

Thanks for reading and I hope this helps someone!
