![Me](public/gh-cover.png)

<p align="center">
  <b>matteing.com</b><br />
  <span align="center">My personal website</span>
</p>

## Features

- **Easy to host**: Website is statically generated on Vercel.
- **Fast**: static site generation, image optimization w/ placeholders, incremental static regeneration.

## Stack

This website is built using the following technologies:

- React
- TypeScript
- NextJS
- TailwindCSS

## Apple Music configuration

The now-playing endpoint requires `AM_USER_TOKEN`. For developer authentication,
configure `AM_TEAM_ID`, `AM_KEY_ID`, and `AM_PRIVATE_KEY`; the app generates and
rotates the short-lived developer JWT automatically. `AM_DEV_TOKEN` remains
supported as a fallback for local development, but it must not be expired.
