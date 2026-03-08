---
title: "Bypassing iWork '09 registration prompts on Snow Leopard"
date: 2026-03-08T00:00:00
url: https://matteing.com/posts/bypassing-iwork-09-registration-prompts-on-snow-leopard
slug: bypassing-iwork-09-registration-prompts-on-snow-leopard
---

# Bypassing iWork '09 registration prompts on Snow Leopard

If you're setting up a vintage Snow Leopard Mac and want iWork '09 running on it, there's a gotcha: the apps won't launch properly unless the system thinks iWork was installed in retail mode. This fixes the main problem. I've done this as part of my first boot script, but there's no reason I see you can't make it part of the image:

```bash
defaults write /Library/Preferences/com.apple.iWork09.Installer InstallMode Retail
```

And then to suppress the registration prompts that pop up every time you open Pages, Keynote, or Numbers:

```bash
defaults write /Library/Preferences/com.apple.iWork09 ShouldNotSendRegistration -bool yes
```

That's it. Two defaults commands and you're good to go.
