---
title: "The no-bullshit guide to hosting an Elixir app on Docker"
date: 2023-11-23T12:00:00
url: https://matteing.com/posts/the-no-bullshit-guide-to-hosting-an-elixir-app-on-docker
slug: the-no-bullshit-guide-to-hosting-an-elixir-app-on-docker
---

# The no-bullshit guide to hosting an Elixir app on Docker

Let's pretend our life depends on transmitting as much tutorial as possible in the least time. Okay, let's kick things off.

1.  Your code should be in a Git repository.
2.  Your remote machine should be running a version of Docker.
3.  I'm only going to focus on deployment and maintenance of the _app_ , not the host server.

## Write a Dockerfile

If you're using Phoenix, you don't have to write one. It generates a masterfully-written Dockerfile for you.

```bash
mix phx.gen.release --docker
```

It's one of the best ones I've ever seen. It's production ready and works with Mix releases.

## Set up Docker Compose

Since we're not doing a multi-host or crazy deployment, Docker Compose is an excellent solution for raising the app quickly.

```yaml
version: "3.8"
services:
  web:
    build: .
    ports:
      - "4000:4000"
    environment:
      - SECRET_KEY_BASE=secret-key
      - DATABASE_URL=postgres://postgres:matteing-is-awesome@postgres:5432/postgres
    deploy:
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    depends_on:
      - postgres
  postgres:
    image: postgres
    restart: always
    user: postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: matteing-is-awesome
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 1s
      timeout: 5s
      retries: 10
```

Change the configuration for anything that seems weird, and fill in your environment settings. I've taken the Postgres bits from their official documentation.

## Clone and raise the app

```bash
git clone git@github.com:matteing/app.git
sudo docker compose up -d
```

Note we used the `-d` flag--this tells Docker to run in detached mode, so the containers keep running in the background, following the restart policy.

## It's up!

Tail the logs and check that deployment out! Nothing works the first time, so fix it and repeat.

```bash
sudo docker compose logs -f
```

## Run migrations

Most likely, the first error you're going to get is a database error. You probably haven't run migrations yet.

```bash
sudo docker exec -it <app>-web-1 /app/bin/migrate
```

## Deploying changes

After you've changed things in your app code, you've gotta rebuild the images and tell compose to restart the changed containers.

```bash
sudo docker compose up --build -d
```

## One-off commands

This is a good introduction to a common maintenance item, which is executing one-off commands or entering the `iex` console.

You interact with your app through a single binary, `<appname>`\--in my case, `athena`. Here's all you can do with it.

```bash
sudo docker exec -it athena-web-1 /app/bin/athena
```

```
Usage: athena COMMAND [ARGS]

The known commands are:

    start          Starts the system
    start_iex      Starts the system with IEx attached
    daemon         Starts the system as a daemon
    daemon_iex     Starts the system as a daemon with IEx attached
    eval "EXPR"    Executes the given expression on a new, non-booted system
    rpc "EXPR"     Executes the given expression remotely on the running system
    remote         Connects to the running system via a remote shell
    restart        Restarts the running system via a remote command
    stop           Stops the running system via a remote command
    pid            Prints the operating system PID of the running system via a remote command
    version        Prints the release name and version to be booted
```

To start a shell:

```bash
sudo docker exec -it athena-web-1 /app/bin/athena remote
# => iex(athena@0963c349efc1)1>
```

## Feedback from readers

A reader and good friend [Giovanni Collazo](https://twitter.com/gcollazo/) noted that all the commands above include `sudo`. Adding yourself to the `docker` group in the system will allow you to overcome this limitation.

```bash
sudo groupadd docker
sudo gpasswd -a $USER docker
# refresh!
newgrp docker
```

**If you're doing a production deployment, place a reverse proxy in front of the app, like Nginx, Caddy or Traefik.** I am running my services in a local server at the moment, so it's not necessary for me, but for a production setup it's a must.

My favorite option is [Caddy](https://www.docker.com/blog/deploying-web-applications-quicker-and-easier-with-caddy-2/). Note that it's important to include the _volumes_ section in the Docker compose--otherwise, Caddy will regenerate all certs on every boot.

## That's all

The quickest and dirtiest guide to going from "zero" to "almost production ready" in an hour.

If you're going public, go through your compose file, harden the instance, and expose.

Enjoy your Elixirist days.
