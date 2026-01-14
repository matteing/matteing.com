---
title: "TIL: Recursively clean up JavaScript projects"
date: 2023-12-21T12:00:00
url: https://matteing.com/posts/til-recursively-clean-up-javascript-projects
slug: til-recursively-clean-up-javascript-projects
---

# TIL: Recursively clean up JavaScript projects

I found that my projects folder was taking up 50GB (?!?!). Here's how to erase node_modules and .next recursively to free it all up:

```bash
# do a safe delete using the trash cli
brew install trash
# show me what you're about to do
find . -name 'node_modules' -type d -prune
find . -name node_modules -type d -prune -exec trash {} +
# show me what you're about to do... again
find . -name '.next' -type d -prune
find . -name ".next" -type d -prune -exec trash {} +
```

From 50 to 5 GB. That is so much better. Maybe next time I'll just use Yarn.
