---
title: "The Majestic Pseudo-Monolith"
date: 2021-10-09T12:00:00
url: https://matteing.com/posts/the-majestic-pseudo-monolith
slug: the-majestic-pseudo-monolith
---

# The Majestic Pseudo-Monolith

Developing a separate frontend for your API backend doesn't have to be multiple-codebase pain.

I'll admit it: I'm in love with my stack. I use Django REST Framework to quickly whip up database entities and business logic, while building a pleasant and fast UI with NextJS. It's an unbeatable stack for me: it allows me to ship products quickly and with great UX.

However, as an indie developer, managing two separate codebases can get jarring, really fast.

Lately I've been playing with optimizing my local development stack to try and achieve the low mental overhead of a monolith, and I think I've gotten as close as it gets. These are my notes.

## Use a monorepo

Set up a single Git repository for both the app and API codebases. This centralizes all your code work and reduces the need for editor window switching. The latter complaint sounds really stupid, but over time it gets annoying to constantly switch between stuff.

My current setup for a Django REST Framework _(update: now Elixir)_ app is as follows:

```
.
.git
.vscode
.buildpacks <--- Buildpack for monorepo support
.gitignore
app <-- NextJS app
server <-- Backend app
Makefile <-- Build scripts
README.md
```

## Simplify common tasks

Now, you'll probably want to get both development servers running with one command. This is super easy with `concurrently` (NPM package for concurrent commands) and a good ol' Makefile.

Create a Makefile and add some commands to it:

```makefile
.PHONY: install app api migrate
SHELL := /bin/bash
DJANGO := poetry run python manage.py

install:
	poetry install
	npm install -g concurrently
	cd app; npm install

dev:
	make migrate
	concurrently \
		-n api,app \
		"PYTHONUNBUFFERED=1 poetry run python manage.py runserver --force-color" \
		"npm run dev --prefix ./app" \
		-c "bgBlue.bold,bgMagenta.bold"

app:
	cd app; npm run dev

api:
	$(DJANGO) runserver

migrate:
	$(DJANGO) makemigrations
	$(DJANGO) migrate
```

## Set up deployments

Deployments are now a little more complicated considering you're going to deploy two apps from one repo. [**If you're on Heroku or similar, you need a special buildpack that allows you to do this.**](https://elements.heroku.com/buildpacks/lstoll/heroku-buildpack-monorepo)

This has the slight disadvantage that if you're running unit tests and whatnot, you'll have to wait for both codebases to finish CI to deploy.

## Set up your editor

You'll notice the file listing I wrote contains a `.vscode` folder: that's intentional! Most editor plugins will be confused by your setup and will need manual configuration.

In my case, ElixirLS was pretty annoyed at the setup, so I needed to tell it which directory to be in:

```json
{
  "elixirLS.projectDir": "server"
}
```

ESLint needed some extra configuration as well. I moved everything to the `package.json` and added `root: true` to the config:

```json
{
  "eslintConfig": {
    "root": true
  }
}
```

## Make a boilerplate

A boilerplate project is crucial to making the pseudo-monolith work. Invest time in your boilerplate, keep it updated and prepare for the _amazing_ productivity improvements.

I now use Elixir's Phoenix for new projects, so I made a boilerplate for that stack. It's simple: if I have a new project idea, I run a one-line terminal command that [**clones the repo**](https://github.com/matteing/stack#quick-start) and [**configures the boilerplate.**](https://github.com/matteing/stack/blob/main/server/boilerplate.exs)

After that, it's off to the races: I'm building API endpoints and React components in minutes. It has everything I use to build great things.

## Some drawbacks

- You'll find yourself doing NPM installs or other commands from the root of the repo, especially if you're on an editor like VS Code where terminals open at the workspace root. This will get annoying.
- Sometimes you actually do want two editor windows open! The editor clutter can get real, even if it's more productive.

## Extra

Note: This is an older article, but I finally got around to publishing it. I hope it helps you escape multiple codebase hell ✨

You'll notice that some parts mention Elixir and others mention Django. Ignore the stack mismatch: the concepts are still true and they both have the same issues.

I've applied these concepts [**at this GitHub repo**](https://github.com/matteing/stack) (with Elixir's Phoenix Framework, but the same concepts apply).
