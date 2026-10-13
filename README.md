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

## Development

Node and pnpm versions are managed by [mise](https://mise.jdx.dev/).

```sh
mise trust
mise install node pnpm
mise run setup
mise run dev
```

Use `mise run build` for a production build and `mise run test` for tests.

## Apple Music configuration

Configure `.env.local` using `.env.example`: Apple Music tokens, the blog's
`MUSIC_SYNC_URL`, and a `MUSIC_SYNC_SECRET` matching the server. The server also
needs `REDIS_URL` for playback state.

From the repo in iTerm, run:

```sh
caffeinate -i mise run music:sync
```

Leave the tab open; Ctrl+C stops syncing. On macOS, `caffeinate` prevents idle
sleep while it runs. Syncing needs no site dependency install. Playback is
estimated from account history and starts after the next track change.
