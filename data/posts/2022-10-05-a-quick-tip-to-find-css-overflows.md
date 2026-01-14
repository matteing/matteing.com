---
title: "A quick tip to find CSS overflows"
date: 2022-10-05T12:00:00
url: https://matteing.com/posts/a-quick-tip-to-find-css-overflows
slug: a-quick-tip-to-find-css-overflows
---

# A quick tip to find CSS overflows

If you're ever struggling with a horizontal CSS overflow, a good way to check what's going on is to add a bright red CSS border to every item on the page.

Here's a snippet that will help you achieve this:

```css
* {
  outline: 1px solid #f00 !important;
}
```

This also helps with all kinds of other styling and positioning problems. Happy designing, folks!
