---
title: "TIL: You can use your local SSH keys in a remote session, without copying them over"
date: 2023-11-21T12:00:00
url: https://matteing.com/posts/til-ssh-forwarding
slug: til-ssh-forwarding
---

# TIL: You can use your local SSH keys in a remote session, without copying them over

Today I wanted to clone a Git repository on a local Raspberry Pi, but I was hesitant to copy my private keys (or even my GitHub ones) over to the device.

This led me to the `ForwardAgent` option, which allows you to forward any SSH keys that are present in your _SSH agent_ (more on this later) to the session on the server.

This allows you to execute a Git clone on the server using your local credentials--without exposing them to risky copies.

To do this, open up `~/.ssh/config`. Find or create a `Host` entry for the host you wish to share keys with. Then, under that entry, add `ForwardAgent yes`. For example:

```
Host hermes.local
  HostName hermes
  ForwardAgent yes
```

This enables SSH agent forwarding for your next SSH session.

However, if you find it malfunctioning, there's a catch--you might need to load your SSH keys to the `ssh-agent` utility manually. To do this on Mac, run:

```bash
ssh-agent -K
```

Try connecting to the remote server and it should all work now. No unsafe funny business.
